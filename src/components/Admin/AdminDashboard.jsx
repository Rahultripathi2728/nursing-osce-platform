import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Bell, 
  SkipForward, 
  Settings, 
  Users, 
  RefreshCw, 
  FileSpreadsheet, 
  UserCheck, 
  KeyRound, 
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Calendar,
  BookOpen,
  Layers,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import StudentDatabasePanel from './StudentDatabasePanel';
import ProcedureManagerPanel from './ProcedureManagerPanel';
import ExamSchedulerPanel from './ExamSchedulerPanel';
import DigitalTimer from '../Shared/DigitalTimer';
import { storageService } from '../../services/storageService';
import { exportService } from '../../services/exportService';

export default function AdminDashboard({
  exam,
  onUpdateExam,
  onOpenRotation,
  onOpenResults,
  onOpenAbsentee
}) {
  const [adminTab, setAdminTab] = useState('cockpit'); // 'cockpit' | 'students' | 'procedures' | 'scheduler' | 'results'
  const [showRotationTrack, setShowRotationTrack] = useState(false);
  const [inspectStationProc, setInspectStationProc] = useState(null);

  // Results search & filter (for inline results tab)
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsFilter, setResultsFilter] = useState('ALL');

  const stations = exam.stations || [];
  const procedures = storageService.getProcedures();
  const examiners = storageService.getExaminers();
  const students = storageService.getStudents();
  const evaluations = storageService.getEvaluations();
  const matrix = storageService.getRotationMatrix();
  const currentRound = exam.currentRound || 1;

  const procMap = {};
  procedures.forEach(p => { procMap[p.id] = p; });
  const examinerMap = {};
  examiners.forEach(e => { examinerMap[e.id] = e; });

  const presentCount = students.filter(s => s.status !== 'Absent').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;

  // Round specific evaluation progress
  let roundEvaluatedCount = 0;
  stations.forEach(stn => {
    const student = storageService.getAssignedStudent(stn.stationNumber, currentRound);
    if (student) {
      const evalKey = `STN_${stn.stationNumber}_STU_${student.id}`;
      if (evaluations[evalKey]) roundEvaluatedCount++;
    }
  });

  const roundEvalPercent = stations.length > 0 ? Math.round((roundEvaluatedCount / stations.length) * 100) : 0;

  // Overall evaluations metrics
  const allEvalKeys = Object.keys(evaluations);
  let totalScoreSum = 0;
  let nonAbsentEvalCount = 0;
  allEvalKeys.forEach(k => {
    const ev = evaluations[k];
    if (ev && !ev.isAbsent && ev.totalScore !== undefined) {
      totalScoreSum += ev.totalScore;
      nonAbsentEvalCount++;
    }
  });
  const avgScore = nonAbsentEvalCount > 0 ? (totalScoreSum / nonAbsentEvalCount).toFixed(1) : '15.5';
  const avgPercent = nonAbsentEvalCount > 0 ? Math.round((parseFloat(avgScore) / 20) * 100) : 78;

  // Total possible max marks for all stations
  let grandMaxMarks = 0;
  for (let s = 1; s <= stations.length; s++) {
    const stn = stations.find(item => item.stationNumber === s);
    const proc = stn ? procMap[stn.procedureId] : null;
    grandMaxMarks += proc ? proc.maxMarks : 20;
  }

  // Compile full gradebook data for the Master Results view
  const compiledGradebook = students.map(student => {
    let studentTotal = 0;
    let hasRedFlag = false;
    let stationsEvaluated = 0;
    const stationScores = {};

    for (let s = 1; s <= stations.length; s++) {
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
    const isCompleted = stationsEvaluated === stations.length;
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

  const filteredGradebook = compiledGradebook.filter(item => {
    const query = resultsSearch.toLowerCase();
    const matchSearch = item.student.rollNo.toLowerCase().includes(query) ||
      item.student.name.toLowerCase().includes(query) ||
      (item.student.fatherName && item.student.fatherName.toLowerCase().includes(query));

    if (resultsFilter === 'PASS') return matchSearch && item.isPass && !item.isAbsent;
    if (resultsFilter === 'FAIL') return matchSearch && (!item.isPass && (item.isCompleted || item.hasRedFlag)) && !item.isAbsent;
    if (resultsFilter === 'ABSENT') return matchSearch && item.isAbsent;
    if (resultsFilter === 'IN_PROGRESS') return matchSearch && !item.isCompleted && !item.isAbsent;
    return matchSearch;
  });

  const passedStudentsCount = compiledGradebook.filter(i => i.isPass && !i.isAbsent).length;
  const inProgressStudentsCount = compiledGradebook.filter(i => !i.isCompleted && !i.isAbsent).length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px', width: '100%', boxSizing: 'border-box' }}>
      {/* Sub-Navigation Bar for Admin Panels */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '14px',
        marginBottom: '20px'
      }}>
        {/* DESKTOP SUBNAV (Hidden on Mobile) */}
        <div className="mobile-hide">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Main Tabs Navigation */}
            <div className="admin-subnav-container">
              <div className="admin-subnav-pills">
                <button
                  onClick={() => setAdminTab('cockpit')}
                  className={`admin-tab-btn ${adminTab === 'cockpit' ? 'active' : ''}`}
                >
                  {exam.status === 'Live' ? <span className="badge-pulse" /> : <Activity size={15} className="tab-icon" />}
                  <span>Live Cockpit</span>
                </button>

                <button
                  onClick={() => setAdminTab('students')}
                  className={`admin-tab-btn ${adminTab === 'students' ? 'active' : ''}`}
                >
                  <Users size={15} className="tab-icon" />
                  <span>Student Roster ({students.length})</span>
                </button>

                <button
                  onClick={() => setAdminTab('procedures')}
                  className={`admin-tab-btn ${adminTab === 'procedures' ? 'active' : ''}`}
                >
                  <BookOpen size={15} className="tab-icon" />
                  <span>Checklists ({procedures.length})</span>
                </button>

                <button
                  onClick={() => setAdminTab('scheduler')}
                  className={`admin-tab-btn ${adminTab === 'scheduler' ? 'active' : ''}`}
                >
                  <Calendar size={15} className="tab-icon" />
                  <span>Exam Scheduler</span>
                </button>

                <button
                  onClick={() => setAdminTab('results')}
                  className={`admin-tab-btn ${adminTab === 'results' ? 'active' : ''}`}
                >
                  <Award size={15} className="tab-icon" />
                  <span>Master Gradebook</span>
                </button>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="admin-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onOpenRotation}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '7px 12px' }}
                title="Open Synchronized Ring Rotation Matrix"
              >
                <RefreshCw size={13} color="#0284c7" />
                <span>Ring Matrix</span>
              </button>
              <button
                onClick={() => exportService.exportMasterExcel()}
                className="btn btn-success"
                style={{ fontSize: '0.8rem', padding: '7px 14px' }}
                title="Download Master Results as Excel Spreadsheet"
              >
                <FileSpreadsheet size={13} />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>

        {/* DEDICATED MOBILE NAVIGATION BAR (Visible on Mobile < 768px) */}
        <div className="mobile-only" style={{ width: '100%', boxSizing: 'border-box' }}>
          {/* 5-Tab Segmented Mobile App Navigation */}
          <div className="admin-mobile-nav">
            <button
              onClick={() => setAdminTab('cockpit')}
              className={`admin-mobile-tab-btn ${adminTab === 'cockpit' ? 'active' : ''}`}
            >
              {exam.status === 'Live' ? <span className="badge-pulse" style={{ marginBottom: '2px' }} /> : <Activity size={17} />}
              <span>Cockpit</span>
            </button>

            <button
              onClick={() => setAdminTab('students')}
              className={`admin-mobile-tab-btn ${adminTab === 'students' ? 'active' : ''}`}
            >
              <Users size={17} />
              <span>Roster</span>
              <span className="mobile-tab-count">({students.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('procedures')}
              className={`admin-mobile-tab-btn ${adminTab === 'procedures' ? 'active' : ''}`}
            >
              <BookOpen size={17} />
              <span>Rubrics</span>
              <span className="mobile-tab-count">({procedures.length})</span>
            </button>

            <button
              onClick={() => setAdminTab('scheduler')}
              className={`admin-mobile-tab-btn ${adminTab === 'scheduler' ? 'active' : ''}`}
            >
              <Calendar size={17} />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => setAdminTab('results')}
              className={`admin-mobile-tab-btn ${adminTab === 'results' ? 'active' : ''}`}
            >
              <Award size={17} />
              <span>Results</span>
            </button>
          </div>

          {/* Quick Action Buttons Grid (Ring Matrix + Excel) */}
          <div className="admin-mobile-actions">
            <button
              onClick={onOpenRotation}
              className="btn btn-outline"
              title="Open Synchronized Ring Rotation Matrix"
            >
              <RefreshCw size={13} color="#0284c7" />
              <span>Ring Matrix</span>
            </button>
            <button
              onClick={() => exportService.exportMasterExcel()}
              className="btn btn-success"
              title="Download Master Results as Excel Spreadsheet"
            >
              <FileSpreadsheet size={13} />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE EXAM COCKPIT                                                 */}
      {/* ========================================================================= */}
      {adminTab === 'cockpit' && (
        <div>
          {/* Synchronized Timer & Bell Console */}
          <DigitalTimer exam={exam} onUpdateExam={onUpdateExam} />

          {/* Clinical Examination Banner */}
          <div className="glass-panel cockpit-banner" style={{
            padding: '18px 22px',
            marginBottom: '16px',
            border: exam.status === 'Live' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
            background: exam.status === 'Live' 
              ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(254, 242, 242, 0.95) 100%)' 
              : 'var(--bg-secondary)',
            boxShadow: exam.status === 'Live' ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {exam.status === 'Live' ? (
                    <span className="badge badge-live" style={{ fontSize: '0.72rem', padding: '5px 12px' }}>
                      <span className="badge-pulse" /> LIVE EXAMINATION IN PROGRESS
                    </span>
                  ) : (
                    <span className="badge badge-scheduled" style={{ fontSize: '0.72rem' }}>
                      STATUS: {exam.status ? exam.status.toUpperCase() : 'SCHEDULED'}
                    </span>
                  )}
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                    {exam.semester}
                  </span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                    ACADEMIC YEAR: {exam.academicYear}
                  </span>
                </div>

                <h1 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                  {exam.title}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '4px' }}>
                  {stations.length} Manned Clinical Stations • {exam.durationMinutes} Minutes / Station • Circular Rotation Active
                </p>
              </div>

              {/* Action Buttons inside Banner */}
              <div className="cockpit-banner-actions">
                <button
                  onClick={() => setShowRotationTrack(!showRotationTrack)}
                  className="btn btn-outline"
                  style={{
                    borderColor: showRotationTrack ? '#0284c7' : 'var(--border-subtle)',
                    background: showRotationTrack ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                    color: showRotationTrack ? '#0284c7' : 'var(--text-primary)'
                  }}
                >
                  <RefreshCw size={13} color="#0284c7" />
                  <span className="mobile-hide">{showRotationTrack ? 'Hide Rotation Wheel' : 'Live Circulation Wheel'}</span>
                  <span className="mobile-only">{showRotationTrack ? 'Hide Wheel' : 'Rotation Wheel'}</span>
                  {showRotationTrack ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                  onClick={() => exportService.exportMasterExcel()}
                  className="btn btn-primary"
                >
                  <FileSpreadsheet size={14} />
                  <span className="mobile-hide">Export Gradebook</span>
                  <span className="mobile-only">Gradebook</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Circular Permutation Wheel / Table */}
            {showRotationTrack && (
              <div style={{
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                animation: 'slideUp 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={15} color="#0284c7" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Real-Time Candidate Circulation Map (Round {currentRound} of {exam.totalRounds || stations.length})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Advance circular shift by clicking "Rotate" in Timer above
                  </span>
                </div>

                <div className="rotation-wheel-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${stations.length}, minmax(130px, 1fr))`,
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '6px'
                }}>
                  {stations.map(stn => {
                    const activeCandidate = storageService.getAssignedStudent(stn.stationNumber, currentRound);
                    const prevCandidate = currentRound > 1 
                      ? storageService.getAssignedStudent(stn.stationNumber, currentRound - 1)
                      : null;
                    const nextCandidate = currentRound < (exam.totalRounds || stations.length)
                      ? storageService.getAssignedStudent(stn.stationNumber, currentRound + 1)
                      : null;

                    const proc = procMap[stn.procedureId];

                    return (
                      <div
                        key={stn.stationNumber}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid rgba(2, 132, 199, 0.25)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                            STN {stn.stationNumber}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {stn.room ? stn.room.split(' ')[0] : 'Lab'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
                          {proc?.name || 'Procedure'}
                        </div>

                        {/* Active Candidate */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)',
                          border: '1px solid rgba(2, 132, 199, 0.35)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '6px 8px',
                          textAlign: 'center',
                          marginBottom: '6px'
                        }}>
                          <div style={{ fontSize: '0.62rem', color: '#0284c7', textTransform: 'uppercase', fontWeight: 700 }}>
                            NOW (R-{currentRound})
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            #{activeCandidate?.rollNo || '—'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeCandidate?.name.split(' ')[0] || 'Unassigned'}
                          </div>
                        </div>

                        {/* Next Shift Candidate */}
                        {nextCandidate && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Next: <strong style={{ color: 'var(--text-secondary)' }}>#{nextCandidate.rollNo} {nextCandidate.name.split(' ')[0]}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5-Column Clinical KPI Statistics Grid */}
          <div className="admin-kpi-grid">
            {/* KPI 1: Active Stations */}
            <div className="glass-panel admin-kpi-card kpi-card-cyan" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Active Stations
                </span>
                <Activity size={16} color="#0284c7" />
              </div>
              <div className="kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stations.length} <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 500 }}>Manned</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                All booths connected & ready
              </div>
            </div>

            {/* KPI 2: Active Round */}
            <div className="glass-panel admin-kpi-card kpi-card-indigo" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Active Round
                </span>
                <Clock size={16} color="#4f46e5" />
              </div>
              <div className="kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                R-{currentRound} <span style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 500 }}>of {exam.totalRounds || stations.length}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Circular rotation synchronized
              </div>
            </div>

            {/* KPI 3: Round Evaluations */}
            <div className="glass-panel admin-kpi-card kpi-card-emerald" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Evaluations (R-{currentRound})
                </span>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div className="kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {roundEvaluatedCount}/{stations.length} <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 500 }}>({roundEvalPercent}%)</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Round completion progress
              </div>
            </div>

            {/* KPI 4: Attendance */}
            <div className="glass-panel admin-kpi-card kpi-card-amber" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Candidate Roster
                </span>
                <Users size={16} color="#d97706" />
              </div>
              <div className="kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {presentCount} <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 500 }}>Present</span>
                {absentCount > 0 && (
                  <span style={{ color: '#ef4444', fontSize: '0.78rem', marginLeft: '6px' }}>({absentCount} Ab)</span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {absentCount === 0 ? '100% full turnout' : `${absentCount} candidate marked absent`}
              </div>
            </div>

            {/* KPI 5: Score Benchmark */}
            <div className="glass-panel admin-kpi-card kpi-card-purple" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Station Average
                </span>
                <Award size={16} color="#7c3aed" />
              </div>
              <div className="kpi-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {avgScore} <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 500 }}>/ 20 M</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cohort Mean: {avgPercent}%
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
                Active Clinical Station Booths ({stations.length})
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Live evaluation monitoring, assigned procedure checklists, and faculty credentials
              </p>
            </div>
            <span className="badge badge-live" style={{ fontSize: '0.68rem' }}>
              <span className="badge-pulse" /> LIVE TELEMETRY
            </span>
          </div>

          {/* Clinical Station Cards Grid */}
          <div className="admin-stations-grid">
            {stations.map(stn => {
              const proc = procMap[stn.procedureId];
              const examiner = examinerMap[stn.examinerId];
              const activeStudent = storageService.getAssignedStudent(stn.stationNumber, currentRound);

              const evalKey = activeStudent ? `STN_${stn.stationNumber}_STU_${activeStudent.id}` : null;
              const evaluation = evalKey ? evaluations[evalKey] : null;

              const isScored = evaluation && !evaluation.isAbsent;
              const isAbsent = evaluation && evaluation.isAbsent;
              const maxMarks = proc ? proc.maxMarks : 20;
              const scorePct = isScored ? Math.round((evaluation.totalScore / maxMarks) * 100) : 0;
              const isPassStation = scorePct >= 50 && !evaluation?.hasRedFlag;

              return (
                <div
                  key={stn.stationNumber}
                  className="glass-panel"
                  style={{
                    padding: '18px 20px',
                    border: isScored 
                      ? '1px solid rgba(16, 185, 129, 0.4)' 
                      : isAbsent 
                      ? '1px solid rgba(239, 68, 68, 0.45)' 
                      : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Station Number, Room & PIN */}
                  <div className="station-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                        Station {stn.stationNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {stn.room || 'Clinical Booth'}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'var(--bg-input)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem'
                    }}>
                      <KeyRound size={12} color="#0284c7" />
                      <span style={{ color: 'var(--text-muted)' }}>PIN:</span>
                      <strong style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{examiner?.pin || '1101'}</strong>
                    </div>
                  </div>

                  {/* Procedure Name & Category */}
                  <div style={{ marginBottom: '8px', minHeight: '44px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.3, margin: '0 0 3px 0' }}>
                      {proc ? proc.name : `Station ${stn.stationNumber}`}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Max: <strong style={{ color: '#0284c7' }}>{maxMarks}M</strong> • {proc?.steps?.length || 0} Rubric Steps
                    </span>
                  </div>

                  {/* Examiner Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '12px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={14} color="#4f46e5" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Examiner: <strong style={{ color: 'var(--text-primary)' }}>{examiner ? examiner.name : 'Unassigned'}</strong>
                      </span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#059669' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                      Ready
                    </span>
                  </div>

                  {/* Candidate at Station Card */}
                  <div style={{
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    border: isAbsent 
                      ? '1px solid rgba(239, 68, 68, 0.5)' 
                      : isScored 
                      ? '1px solid rgba(5, 150, 105, 0.45)' 
                      : '1px solid var(--border-subtle)',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                      Candidate at Station (Round {currentRound})
                    </div>

                    {activeStudent ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontWeight: 800,
                              color: '#0284c7',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.95rem'
                            }}>
                              #{activeStudent.rollNo}
                            </span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {activeStudent.name}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Father: {activeStudent.fatherName || '—'}
                          </div>
                        </div>

                        <div>
                          {isAbsent ? (
                            <span className="badge badge-danger">ABSENT</span>
                          ) : isScored ? (
                            <span className={`badge ${isPassStation ? 'badge-emerald' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                              <CheckCircle2 size={12} /> {evaluation.totalScore}/{maxMarks} M
                            </span>
                          ) : (
                            <span className="badge badge-scheduled" style={{ fontSize: '0.72rem' }}>
                              <Clock size={11} /> Evaluating...
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No candidate assigned in this round
                      </div>
                    )}
                  </div>

                  {/* Station Quick Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <button
                      onClick={() => setInspectStationProc(proc)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                    >
                      <BookOpen size={12} color="#0284c7" /> Rubric Steps ({proc?.steps?.length || 0})
                    </button>

                    {activeStudent && !isScored && !isAbsent && (
                      <button
                        onClick={() => onOpenAbsentee(activeStudent, stn.stationNumber)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.72rem', padding: '5px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        title="Mark student absent for this station"
                      >
                        Mark Absent
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CANDIDATE DATABASE PANEL                                          */}
      {/* ========================================================================= */}
      {adminTab === 'students' && (
        <StudentDatabasePanel />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROCEDURES & CHECKLISTS MANAGER                                   */}
      {/* ========================================================================= */}
      {adminTab === 'procedures' && (
        <ProcedureManagerPanel />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SCHEDULE EXAM & STATIONS                                          */}
      {/* ========================================================================= */}
      {adminTab === 'scheduler' && (
        <ExamSchedulerPanel
          onScheduleSaved={(newExam) => {
            onUpdateExam(newExam);
            setAdminTab('cockpit');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MASTER GRADEBOOK (INLINE PANEL)                                    */}
      {/* ========================================================================= */}
      {adminTab === 'results' && (
        <div>
          {/* Top Gradebook Banner */}
          <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-emerald">OFFICIAL GRADEBOOK</span>
                  <span className="badge badge-cyan">{exam.semester}</span>
                </div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0 }}>
                  Summative OSCE Master Examination Results
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {exam.title} • Minimum Passing Criteria: 50% without safety red flag breach
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => exportService.exportMasterExcel()}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.825rem' }}
                >
                  <FileSpreadsheet size={14} /> Download Excel (.xlsx)
                </button>
                <button
                  onClick={() => exportService.exportMasterCSV()}
                  className="btn btn-outline"
                  style={{ padding: '8px 14px', fontSize: '0.825rem' }}
                >
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>

            {/* KPI Summary for Gradebook */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Enrolled</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7' }}>{students.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passed (Summative)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>{passedStudentsCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Progress (Active)</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706' }}>{inProgressStudentsCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OSCE Stations</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4f46e5' }}>{stations.length} Stations</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grand Max Marks</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{grandMaxMarks} M</div>
              </div>
            </div>

            {/* Search & Filter Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-input)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                minWidth: '240px',
                flex: '1 1 240px'
              }}>
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search candidate name, roll no, father..."
                  value={resultsSearch}
                  onChange={(e) => setResultsSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'ALL', label: 'All Candidates' },
                  { id: 'PASS', label: 'Passed' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'FAIL', label: 'Needs Remediation' },
                  { id: 'ABSENT', label: 'Absent' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setResultsFilter(id)}
                    className="btn btn-outline"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      borderColor: resultsFilter === id ? '#0284c7' : 'var(--border-subtle)',
                      background: resultsFilter === id ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      color: resultsFilter === id ? '#0284c7' : 'var(--text-secondary)',
                      fontWeight: resultsFilter === id ? 700 : 500
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Master Results Table */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px 14px' }}>S.No</th>
                    <th style={{ padding: '12px 14px' }}>Roll No</th>
                    <th style={{ padding: '12px 14px' }}>Candidate Name</th>
                    <th style={{ padding: '12px 14px' }}>Father's Name</th>
                    {Array.from({ length: stations.length }, (_, i) => i + 1).map(stnNum => (
                      <th key={stnNum} style={{ padding: '12px 10px', textAlign: 'center' }}>
                        Stn {stnNum}
                      </th>
                    ))}
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Total Score</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>%</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGradebook.length === 0 ? (
                    <tr>
                      <td colSpan={6 + stations.length} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No candidate results match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGradebook.map(({ student, stationScores, studentTotal, percentage, isPass, isCompleted, stationsEvaluated, hasRedFlag, isAbsent }) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {student.serialNo || '-'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                          #{student.rollNo}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {student.name}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                          {student.fatherName || '-'}
                        </td>

                        {Array.from({ length: stations.length }, (_, i) => i + 1).map(stnNum => {
                          const val = stationScores[stnNum];
                          return (
                            <td key={stnNum} style={{ padding: '12px 10px', textAlign: 'center' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.85rem',
                                color: val === 'ABSENT' ? '#ef4444' : val === '-' ? 'var(--text-muted)' : '#0284c7',
                                fontWeight: val !== '-' && val !== 'ABSENT' ? 700 : 400
                              }}>
                                {val}
                              </span>
                            </td>
                          );
                        })}

                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {isAbsent ? '0' : `${studentTotal} / ${grandMaxMarks}`}
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isAbsent ? '#ef4444' : (percentage >= 50 ? '#059669' : '#d97706') }}>
                          {isAbsent ? '0%' : `${percentage}%`}
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          {isAbsent ? (
                            <span className="badge badge-danger">ABSENT</span>
                          ) : hasRedFlag ? (
                            <span className="badge badge-danger" title="Safety Protocol Breach">FAIL (FLAG)</span>
                          ) : !isCompleted ? (
                            <span className="badge badge-amber" title={`${stationsEvaluated} of ${stations.length} stations completed`}>
                              IN PROGRESS ({stationsEvaluated}/{stations.length})
                            </span>
                          ) : isPass ? (
                            <span className="badge badge-emerald">
                              {percentage >= 75 ? 'DISTINCTION' : 'PASS'}
                            </span>
                          ) : (
                            <span className="badge badge-danger">REMEDIAL</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- QUICK RUBRIC INSPECTOR MODAL --- */}
      {inspectStationProc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {inspectStationProc.semester || 'Semester II'}
                </span>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {inspectStationProc.name}
                </h3>
              </div>
              <button onClick={() => setInspectStationProc(null)} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Total Marks: <strong style={{ color: '#0284c7' }}>{inspectStationProc.maxMarks}M</strong> • Standard Time: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(inspectStationProc.defaultDurationSeconds / 60)} Mins</strong>
              </div>

              {inspectStationProc.redFlag && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>
                    <strong style={{ color: '#dc2626' }}>Critical Red Flag:</strong> {inspectStationProc.redFlag}
                  </div>
                </div>
              )}

              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Checklist Evaluation Rubric ({inspectStationProc.steps?.length || 0} Steps)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                {inspectStationProc.steps?.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0284c7', width: '18px', fontWeight: 700 }}>
                        {idx + 1}.
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        {step.text}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#0284c7', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0, fontWeight: 700 }}>
                      {step.marks}M
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button onClick={() => setInspectStationProc(null)} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
