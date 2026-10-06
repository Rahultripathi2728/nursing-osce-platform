import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { exportService } from '../../services/exportService';

export default function ResultSummaryModal({ onClose }) {
  const exam = storageService.getExam();
  const students = storageService.getStudents();
  const procedures = storageService.getProcedures();
  const evaluations = storageService.getEvaluations();
  const stationCount = exam.stationCount || 6;

  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');

  const procMap = {};
  procedures.forEach(p => { procMap[p.id] = p; });

  let grandMaxMarks = 0;
  for (let s = 1; s <= stationCount; s++) {
    const stnConfig = exam.stations.find(st => st.stationNumber === s);
    const proc = stnConfig ? procMap[stnConfig.procedureId] : null;
    grandMaxMarks += proc ? proc.maxMarks : 20;
  }

  // Compile candidate rows
  const compiledData = students.map((student) => {
    let studentTotal = 0;
    let hasRedFlag = false;
    let stationsEvaluated = 0;
    const stationScores = {};

    for (let s = 1; s <= stationCount; s++) {
      const evalKey = `STN_${s}_STU_${student.id}`;
      const evalData = evaluations[evalKey];

      if (evalData) {
        if (evalData.isAbsent) {
          stationScores[s] = 'ABSENT';
        } else {
          const score = evalData.totalScore !== undefined ? evalData.totalScore : 0;
          stationScores[s] = score;
          studentTotal += score;
          stationsEvaluated++;
          if (evalData.hasRedFlag) hasRedFlag = true;
        }
      } else {
        stationScores[s] = '-';
      }
    }

    const percentage = grandMaxMarks > 0 ? ((studentTotal / grandMaxMarks) * 100).toFixed(1) : 0;
    const isCompleted = stationsEvaluated === stationCount;
    const isPass = percentage >= 50 && !hasRedFlag && student.status !== 'Absent' && isCompleted;

    return {
      student,
      stationScores,
      studentTotal,
      percentage,
      stationsEvaluated,
      isCompleted,
      isPass,
      hasRedFlag,
      isAbsent: student.status === 'Absent'
    };
  });

  const filtered = compiledData.filter(item => {
    const matchSearch = item.student.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      item.student.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.student.fatherName && item.student.fatherName.toLowerCase().includes(search.toLowerCase()));

    if (filterResult === 'PASS') return matchSearch && item.isPass && !item.isAbsent;
    if (filterResult === 'FAIL') return matchSearch && (!item.isPass && (item.isCompleted || item.hasRedFlag)) && !item.isAbsent;
    if (filterResult === 'ABSENT') return matchSearch && item.isAbsent;
    if (filterResult === 'IN_PROGRESS') return matchSearch && !item.isCompleted && !item.isAbsent;
    return matchSearch;
  });

  const passedCount = compiledData.filter(i => i.isPass && !i.isAbsent).length;
  const inProgressCount = compiledData.filter(i => !i.isCompleted && !i.isAbsent).length;
  const passPercentage = students.length > 0 ? ((passedCount / students.length) * 100).toFixed(0) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1120px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: '#ffffff',
              boxShadow: '0 0 14px rgba(14, 165, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>OSCE Master Examination Results</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                {exam.title} • {exam.semester} • Passing Threshold: 50%
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => exportService.exportMasterExcel()}
              className="btn btn-primary"
              style={{ padding: '7px 12px', fontSize: '0.78rem' }}
            >
              <FileSpreadsheet size={14} />
              Excel (.xlsx)
            </button>

            <button
              onClick={() => exportService.exportMasterCSV()}
              className="btn btn-outline"
              style={{ padding: '7px 10px', fontSize: '0.78rem' }}
            >
              <Download size={14} />
              CSV
            </button>

            <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin-kpi-grid" style={{
          padding: '14px 18px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidates</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{students.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Passed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{passedCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({passPercentage}%)</span></div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{inProgressCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active</span></div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stations</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>{stationCount} Stations</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Marks</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{grandMaxMarks} M</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          padding: '10px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            minWidth: '200px',
            flex: '1 1 200px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search candidate / father / roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.8rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PASS', label: 'Passed' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'FAIL', label: 'Failed' },
              { id: 'ABSENT', label: 'Absent' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterResult(id)}
                className="btn btn-outline"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  borderColor: filterResult === id ? '#0284c7' : 'var(--border-subtle)',
                  background: filterResult === id ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                  color: filterResult === id ? '#0284c7' : 'var(--text-secondary)',
                  fontWeight: filterResult === id ? 700 : 500
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Table */}
        <div style={{ padding: '12px 16px', maxHeight: '420px', overflowY: 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', background: 'var(--bg-surface)' }}>
                <th style={{ padding: '10px 12px' }}>S.No</th>
                <th style={{ padding: '10px 12px' }}>Roll No</th>
                <th style={{ padding: '10px 12px' }}>Candidate Name</th>
                <th style={{ padding: '10px 12px' }}>Father's Name</th>
                {Array.from({ length: stationCount }, (_, i) => i + 1).map(stnNum => (
                  <th key={stnNum} style={{ padding: '10px 8px', textAlign: 'center' }}>
                    Stn {stnNum}
                  </th>
                ))}
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Total Score</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>%</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ student, stationScores, studentTotal, percentage, isPass, isCompleted, stationsEvaluated, hasRedFlag, isAbsent }) => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {student.serialNo || '-'}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    #{student.rollNo}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {student.name}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {student.fatherName || '-'}
                  </td>

                  {Array.from({ length: stationCount }, (_, i) => i + 1).map(stnNum => {
                    const val = stationScores[stnNum];
                    return (
                      <td key={stnNum} style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          color: val === 'ABSENT' ? '#ef4444' : val === '-' ? 'var(--text-muted)' : '#0284c7',
                          fontWeight: val !== '-' && val !== 'ABSENT' ? 700 : 400
                        }}>
                          {val}
                        </span>
                      </td>
                    );
                  })}

                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {isAbsent ? '0' : `${studentTotal} / ${grandMaxMarks}`}
                  </td>

                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, color: isAbsent ? '#ef4444' : (percentage >= 50 ? '#059669' : '#d97706') }}>
                    {isAbsent ? '0%' : `${percentage}%`}
                  </td>

                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {isAbsent ? (
                      <span className="badge badge-danger">ABSENT</span>
                    ) : hasRedFlag ? (
                      <span className="badge badge-danger" title="Safety Breach">FAIL (FLAG)</span>
                    ) : !isCompleted ? (
                      <span className="badge badge-amber" title={`${stationsEvaluated} of ${stationCount} stations evaluated`}>
                        IN PROGRESS ({stationsEvaluated}/{stationCount})
                      </span>
                    ) : isPass ? (
                      <span className="badge badge-emerald">
                        {percentage >= 75 ? 'DISTINCTION' : 'PASS'}
                      </span>
                    ) : (
                      <span className="badge badge-danger">FAIL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Report auto-compiles all university OSCE checklists, marks, and examiner remarks.
          </span>

          <button onClick={onClose} className="btn btn-outline" style={{ padding: '7px 20px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
