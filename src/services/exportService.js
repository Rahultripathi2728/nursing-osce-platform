// One-Click Multi-Sheet Excel & CSV Exporter for Nursing OSCE Platform
// Generates university-compliant consolidated marksheets and station-by-station breakdowns

import * as XLSX from 'xlsx';
import { storageService } from './storageService';

export const exportService = {
  /**
   * Generates a multi-sheet master Excel workbook (.xlsx)
   */
  exportMasterExcel() {
    const exam = storageService.getExam();
    const students = storageService.getStudents();
    const procedures = storageService.getProcedures();
    const examiners = storageService.getExaminers();
    const evaluations = storageService.getEvaluations();
    const stationCount = exam.stationCount || 6;

    const wb = XLSX.utils.book_new();

    // 1. MASTER SUMMARY SHEET DATA
    const summaryRows = [];
    const procedureMap = {};
    procedures.forEach(p => { procedureMap[p.id] = p; });
    const examinerMap = {};
    examiners.forEach(e => { examinerMap[e.id] = e; });

    let grandMaxMarks = 0;
    const stationHeaders = [];
    for (let stn = 1; stn <= stationCount; stn++) {
      const stnConfig = exam.stations.find(s => s.stationNumber === stn);
      const proc = stnConfig ? procedureMap[stnConfig.procedureId] : null;
      const maxM = proc ? proc.maxMarks : 20;
      grandMaxMarks += maxM;
      stationHeaders.push({
        stnNumber: stn,
        procName: proc ? proc.name : `Station ${stn}`,
        maxMarks: maxM
      });
    }

    students.forEach((student, index) => {
      const row = {
        'S.No': student.serialNo || index + 1,
        'Roll No': student.rollNo,
        'Student Name': student.name,
        "Father's Name": student.fatherName || 'N/A',
        'Semester': student.semester || exam.semester || 'Semester VII',
        'Academic Year': student.academicYear || '4th Year',
        'PRN / Enrollment': student.prn,
        'Status': student.status || 'Present'
      };

      let studentTotal = 0;
      let hasRedFlag = false;

      stationHeaders.forEach(({ stnNumber, maxMarks }) => {
        const evalKey = `STN_${stnNumber}_STU_${student.id}`;
        const evalData = evaluations[evalKey];

        if (evalData) {
          if (evalData.isAbsent) {
            row[`Stn ${stnNumber} (${maxMarks}M)`] = 'ABSENT';
          } else {
            const score = evalData.totalScore !== undefined ? evalData.totalScore : 0;
            row[`Stn ${stnNumber} (${maxMarks}M)`] = score;
            studentTotal += score;
            if (evalData.hasRedFlag) hasRedFlag = true;
          }
        } else {
          row[`Stn ${stnNumber} (${maxMarks}M)`] = 'Pending';
        }
      });

      const percentage = grandMaxMarks > 0 ? ((studentTotal / grandMaxMarks) * 100).toFixed(1) : 0;
      const isPass = percentage >= 50 && !hasRedFlag && student.status !== 'Absent';

      row['Total Marks'] = studentTotal;
      row['Max Marks'] = grandMaxMarks;
      row['Percentage (%)'] = `${percentage}%`;
      row['Result'] = student.status === 'Absent' ? 'ABSENT' : (isPass ? 'PASS' : 'FAIL');
      row['Remarks'] = hasRedFlag ? 'Critical Safety Violation (Red Flag)' : (percentage >= 75 ? 'Distinction' : (isPass ? 'First Class' : 'Remedial Required'));

      summaryRows.push(row);
    });

    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Consolidated Results');

    // 2. INDIVIDUAL STATION BREAKDOWN SHEETS
    for (let stn = 1; stn <= stationCount; stn++) {
      const stnConfig = exam.stations.find(s => s.stationNumber === s);
      const proc = stnConfig ? procedureMap[stnConfig.procedureId] : null;
      const examiner = stnConfig ? examinerMap[stnConfig.examinerId] : null;

      const stationRows = [];
      students.forEach((student, index) => {
        const evalKey = `STN_${stn}_STU_${student.id}`;
        const evalData = evaluations[evalKey];

        stationRows.push({
          'S.No': student.serialNo || index + 1,
          'Roll No': student.rollNo,
          'Candidate Name': student.name,
          "Father's Name": student.fatherName || 'N/A',
          'Semester': student.semester || exam.semester || 'Semester VII',
          'Procedure': proc ? proc.name : `Station ${stn}`,
          'Station Examiner': examiner ? examiner.name : 'Unassigned',
          'Score Awarded': evalData ? (evalData.isAbsent ? 'ABSENT' : evalData.totalScore) : 'Pending',
          'Max Marks': proc ? proc.maxMarks : 20,
          'Red Flag': evalData && evalData.hasRedFlag ? 'YES (Breach)' : 'NO',
          'Examiner Remarks': evalData ? (evalData.remarks || 'Competent execution') : 'Awaiting evaluation',
          'Submission Time': evalData ? (evalData.submittedAt || '-') : '-'
        });
      });

      const stnWs = XLSX.utils.json_to_sheet(stationRows);
      XLSX.utils.book_append_sheet(wb, stnWs, `Station ${stn}`);
    }

    // Trigger Download
    const fileName = `OSCE_Results_${exam.semester.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  /**
   * Generates a standardized CSV export
   */
  exportMasterCSV() {
    const exam = storageService.getExam();
    const students = storageService.getStudents();
    const evaluations = storageService.getEvaluations();
    const stationCount = exam.stationCount || 6;

    const rows = [];
    students.forEach((student, index) => {
      let total = 0;
      const row = {
        'S.No': student.serialNo || index + 1,
        'Roll_No': student.rollNo,
        'Candidate_Name': student.name,
        'Father_Name': student.fatherName || 'N/A',
        'Semester': student.semester || exam.semester || 'Semester VII',
        'PRN': student.prn
      };

      for (let stn = 1; stn <= stationCount; stn++) {
        const evalKey = `STN_${stn}_STU_${student.id}`;
        const evalData = evaluations[evalKey];
        const score = evalData ? (evalData.isAbsent ? 0 : evalData.totalScore) : 0;
        row[`Station_${stn}`] = evalData && evalData.isAbsent ? 'AB' : score;
        total += score;
      }

      row['Total_Score'] = total;
      row['Result'] = total >= (stationCount * 20 * 0.5) ? 'PASS' : 'FAIL';
      rows.push(row);
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OSCE_Gradebook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
