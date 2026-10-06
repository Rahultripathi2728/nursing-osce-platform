import React, { useState } from 'react';
import { X, Calendar, BookOpen, Clock, Settings, Check } from 'lucide-react';
import { PRELOADED_SUBJECTS } from '../../data/preloadedData';
import { storageService } from '../../services/storageService';

export default function ExamSetupModal({ onClose, onUpdate }) {
  const currentExam = storageService.getExam();
  const [title, setTitle] = useState(currentExam.title || '');
  const [subjectId, setSubjectId] = useState(currentExam.subjectId || 'NF');
  const [semester, setSemester] = useState(currentExam.semester || 'Semester II');
  const [stationCount, setStationCount] = useState(currentExam.stationCount || 6);
  const [durationMinutes, setDurationMinutes] = useState(currentExam.durationMinutes || 5);
  const [absenteePolicy, setAbsenteePolicy] = useState(currentExam.absenteePolicy || 'DYNAMIC_BUFFER');

  const selectedSubject = PRELOADED_SUBJECTS.find(s => s.id === subjectId);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Rebuild or preserve stations
    const existingStations = currentExam.stations || [];
    const newStations = [];
    const procedures = storageService.getProcedures();
    const examiners = storageService.getExaminers();

    for (let i = 1; i <= Number(stationCount); i++) {
      const existing = existingStations.find(s => s.stationNumber === i);
      if (existing) {
        newStations.push(existing);
      } else {
        const proc = procedures[(i - 1) % procedures.length];
        const ex = examiners[(i - 1) % examiners.length];
        newStations.push({
          stationNumber: i,
          procedureId: proc.id,
          examinerId: ex.id,
          room: `Skill Lab Bed ${i}`
        });
      }
    }

    const updated = {
      ...currentExam,
      title,
      subjectId,
      semester,
      stationCount: Number(stationCount),
      totalRounds: Number(stationCount),
      durationMinutes: Number(durationMinutes),
      absenteePolicy,
      stations: newStations
    };

    storageService.saveExam(updated);
    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}>
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Configure OSCE Examination</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Set up academic semester, stations, station duration, and rotation rules
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Examination Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Nursing Clinical Specialty
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    const sub = PRELOADED_SUBJECTS.find(s => s.id === e.target.value);
                    if (sub && sub.semesters.length > 0) setSemester(sub.semesters[0]);
                  }}
                  className="form-select"
                >
                  {PRELOADED_SUBJECTS.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Academic Semester (INC)
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="form-select"
                >
                  {selectedSubject?.semesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Number of Stations (Circuits)
                </label>
                <select
                  value={stationCount}
                  onChange={(e) => setStationCount(e.target.value)}
                  className="form-select"
                >
                  {[4, 5, 6, 7, 8, 10, 12].map(num => (
                    <option key={num} value={num}>{num} Stations ({num} Candidates per batch)</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Time per Station (Minutes)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="form-select"
                >
                  {[3, 4, 5, 6, 7, 8, 10].map(m => (
                    <option key={m} value={m}>{m} Minutes per Station</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Default Absentee Policy
              </label>
              <select
                value={absenteePolicy}
                onChange={(e) => setAbsenteePolicy(e.target.value)}
                className="form-select"
              >
                <option value="DYNAMIC_BUFFER">Dynamic Buffer (Instantly pull next candidate in queue)</option>
                <option value="SMART_PAUSE">Smart Shift (Convert station to rest break for absent slot)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save & Apply Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
