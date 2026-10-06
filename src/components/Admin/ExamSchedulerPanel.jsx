import React, { useState } from 'react';
import { 
  Calendar, 
  Settings, 
  UserCheck, 
  KeyRound, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function ExamSchedulerPanel({ onScheduleSaved }) {
  const currentExam = storageService.getExam();
  const procedures = storageService.getProcedures();
  const examiners = storageService.getExaminers();
  const allStudents = storageService.getStudents();

  const [title, setTitle] = useState(currentExam.title || 'B.Sc. Nursing OSCE Examination');
  const [semester, setSemester] = useState(currentExam.semester || 'Semester II');
  const [stationCount, setStationCount] = useState(currentExam.stationCount || 6);
  const [durationMinutes, setDurationMinutes] = useState(currentExam.durationMinutes || 5);
  const [stations, setStations] = useState(currentExam.stations || []);

  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');

  // Count candidates enrolled in the selected semester
  const enrolledCandidates = allStudents.filter(s => s.semester === semester);

  // When station count changes, ensure stations array matches length
  const handleStationCountChange = (count) => {
    const num = Number(count);
    setStationCount(num);

    const updated = [];
    for (let i = 1; i <= num; i++) {
      const existing = stations.find(s => s.stationNumber === i);
      if (existing) {
        updated.push(existing);
      } else {
        const proc = procedures[(i - 1) % procedures.length];
        const ex = examiners[(i - 1) % examiners.length];
        updated.push({
          stationNumber: i,
          procedureId: proc?.id || 'PROC-NF-01',
          examinerId: ex?.id || 'FAC-01',
          room: `Skill Lab Booth ${i}`
        });
      }
    }
    setStations(updated);
  };

  // Reassign Examiner with Collision Prevention (Swap if already assigned)
  const handleExaminerChange = (stationNumber, newExaminerId) => {
    setConflictWarning('');
    const updated = [...stations];

    // Check if newExaminerId is already assigned to a DIFFERENT station
    const existingStationIndex = updated.findIndex(
      s => s.examinerId === newExaminerId && s.stationNumber !== stationNumber
    );

    const targetIndex = updated.findIndex(s => s.stationNumber === stationNumber);
    if (targetIndex === -1) return;

    if (existingStationIndex !== -1) {
      // SWAP: Give the old examiner from target station to the other station to avoid duplicate!
      const oldExaminerId = updated[targetIndex].examinerId;
      updated[existingStationIndex].examinerId = oldExaminerId;

      const exObj = examiners.find(e => e.id === newExaminerId);
      const oldExObj = examiners.find(e => e.id === oldExaminerId);
      setConflictWarning(
        `Examiner Swap: ${exObj?.name} was already on Station ${updated[existingStationIndex].stationNumber}. Swapped with ${oldExObj?.name} to prevent duplicate assignment.`
      );
    }

    updated[targetIndex].examinerId = newExaminerId;
    setStations(updated);
  };

  const handleProcedureChange = (stationNumber, newProcId) => {
    setStations(prev => prev.map(s => {
      if (s.stationNumber === stationNumber) {
        return { ...s, procedureId: newProcId };
      }
      return s;
    }));
  };

  const handleRoomChange = (stationNumber, newRoom) => {
    setStations(prev => prev.map(s => {
      if (s.stationNumber === stationNumber) {
        return { ...s, room: newRoom };
      }
      return s;
    }));
  };

  const handleSaveAndDeploy = (e) => {
    e.preventDefault();

    const deployedExam = {
      ...currentExam,
      title,
      semester,
      stationCount: Number(stationCount),
      totalRounds: Number(stationCount),
      durationMinutes: Number(durationMinutes),
      stations,
      status: 'Live',
      currentRound: 1
    };

    storageService.saveExam(deployedExam);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
    if (onScheduleSaved) onScheduleSaved(deployedExam);
  };

  const copyCredentialsText = () => {
    const textLines = stations.map(stn => {
      const ex = examiners.find(e => e.id === stn.examinerId);
      const pr = procedures.find(p => p.id === stn.procedureId);
      return `Station ${stn.stationNumber}: ${ex?.name} | Faculty ID: ${ex?.id} | Login PIN: ${ex?.pin} | Procedure: ${pr?.name}`;
    }).join('\n');

    navigator.clipboard.writeText(textLines);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-indigo">Exam Scheduler</span>
              <span className="badge badge-cyan">Auto-Credential Engine</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>
              Schedule & Configure Nursing OSCE Examination
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
              Configure stations, rotation timings, procedure checklists, and auto-generated examiner credentials.
            </p>
          </div>

          <button onClick={copyCredentialsText} className="btn btn-secondary">
            {copiedCredentials ? <Check size={15} color="#059669" /> : <Copy size={15} color="#0284c7" />}
            {copiedCredentials ? 'Credentials Copied!' : 'Copy Faculty Credentials'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <Check size={18} color="#059669" />
          <span>Exam scheduled successfully! All stations, rotation rules, and faculty PINs are deployed live.</span>
        </div>
      )}

      {conflictWarning && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid #eab308',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          color: 'var(--text-primary)',
          fontSize: '0.825rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} color="#d97706" />
          <span>{conflictWarning}</span>
        </div>
      )}

      <form onSubmit={handleSaveAndDeploy}>
        {/* Step 1: Exam Global Parameters */}
        <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '14px' }}>
            1. Examination Basic Parameters
          </h3>

          <div className="scheduler-params-grid">
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Examination Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Candidate Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="form-select"
              >
                {[
                  'Semester I', 'Semester II', 'Semester III', 'Semester IV',
                  'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'
                ].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                {enrolledCandidates.length} enrolled in {semester}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Number of OSCE Stations *
              </label>
              <select
                value={stationCount}
                onChange={(e) => handleStationCountChange(e.target.value)}
                className="form-select"
              >
                {[4, 5, 6, 7, 8, 10, 12].map(n => (
                  <option key={n} value={n}>{n} Stations ({n} candidates/circle)</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Rotation Time (Minutes) *
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="form-select"
              >
                {[3, 4, 5, 6, 7, 8, 10].map(m => (
                  <option key={m} value={m}>{m} Minutes / Station</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Station Configuration & Collision-Free Assignment */}
        <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '18px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              2. Station & Faculty Assignment (No-Collision Guaranteed)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Assign checklists and examiners. Selecting an assigned faculty automatically swaps stations.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stations.slice(0, stationCount).map(stn => {
              const assignedExaminer = examiners.find(e => e.id === stn.examinerId);

              return (
                <div
                  key={stn.stationNumber}
                  className="scheduler-station-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1.5fr 1.5fr 130px',
                    gap: '12px',
                    alignItems: 'center',
                    background: 'var(--bg-input)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {/* Station Number & Room (grouped in header on mobile) */}
                  <div className="scheduler-station-header">
                    <div className="station-badge-room">
                      <span className="badge badge-cyan" style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                        Station {stn.stationNumber}
                      </span>
                      <input
                        type="text"
                        value={stn.room || ''}
                        onChange={(e) => handleRoomChange(stn.stationNumber, e.target.value)}
                        placeholder="Room / Lab"
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      />
                    </div>

                    {/* PIN badge on mobile (inline with header) */}
                    <div className="mobile-only" style={{
                      background: 'var(--bg-secondary)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      textAlign: 'center',
                      fontSize: '0.72rem'
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>PIN: </span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: '#0284c7' }}>{assignedExaminer?.pin || '1101'}</strong>
                    </div>
                  </div>

                  {/* Procedure Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Assigned Procedure Checklist
                    </label>
                    <select
                      value={stn.procedureId}
                      onChange={(e) => handleProcedureChange(stn.stationNumber, e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                    >
                      {procedures.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.maxMarks}M)</option>
                      ))}
                    </select>
                  </div>

                  {/* Examiner Dropdown (With Collision Prevention) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      Assigned Faculty Examiner
                    </label>
                    <select
                      value={stn.examinerId}
                      onChange={(e) => handleExaminerChange(stn.stationNumber, e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                    >
                      {examiners.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-Generated Login PIN on Desktop */}
                  <div className="mobile-hide" style={{
                    background: 'var(--bg-secondary)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Login PIN
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                      {assignedExaminer?.pin || '1101'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Deploy Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px 0' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: '1 1 240px' }}>
            Saving automatically deploys rotation rules and updates examiner mobile screens upon refresh.
          </div>

          <button type="submit" className="btn btn-live" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
            <ShieldCheck size={16} /> Save & Deploy Live OSCE Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
