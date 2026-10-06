import React, { useState } from 'react';
import { X, Settings2, Stethoscope, UserCheck, MapPin, KeyRound, Check } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function StationConfigModal({ onClose, onUpdate }) {
  const [exam, setExam] = useState(storageService.getExam());
  const procedures = storageService.getProcedures();
  const examiners = storageService.getExaminers();
  const [stations, setStations] = useState(exam.stations || []);

  const handleProcedureChange = (stnNum, procId) => {
    setStations(prev => prev.map(s => {
      if (s.stationNumber === stnNum) {
        return { ...s, procedureId: procId };
      }
      return s;
    }));
  };

  const handleExaminerChange = (stnNum, exId) => {
    setStations(prev => prev.map(s => {
      if (s.stationNumber === stnNum) {
        return { ...s, examinerId: exId };
      }
      return s;
    }));
  };

  const handleRoomChange = (stnNum, roomName) => {
    setStations(prev => prev.map(s => {
      if (s.stationNumber === stnNum) {
        return { ...s, room: roomName };
      }
      return s;
    }));
  };

  const handleSave = () => {
    const updated = {
      ...exam,
      stations
    };
    storageService.saveExam(updated);
    if (onUpdate) onUpdate();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '840px' }}>
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
              <Settings2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Station & Faculty Configuration</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Assign clinical procedures, rooms, and examiners with auto-generated credentials
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Stations List */}
        <div style={{ padding: '24px', maxHeight: '520px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stations.map(stn => {
              const assignedExaminer = examiners.find(e => e.id === stn.examinerId);

              return (
                <div key={stn.stationNumber} className="glass-panel" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-live">Station {stn.stationNumber}</span>
                      <input 
                        type="text" 
                        value={stn.room || ''} 
                        onChange={(e) => handleRoomChange(stn.stationNumber, e.target.value)}
                        placeholder="Room / Booth Name"
                        className="form-input"
                        style={{ padding: '4px 10px', fontSize: '0.8rem', width: '200px' }}
                      />
                    </div>

                    {assignedExaminer && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-input)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem'
                      }}>
                        <KeyRound size={13} color="#0284c7" />
                        <span style={{ color: 'var(--text-muted)' }}>Examiner Login PIN:</span>
                        <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>{assignedExaminer.pin}</strong>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Assigned Clinical Procedure (OSCE Checklist)
                      </label>
                      <select 
                        value={stn.procedureId} 
                        onChange={(e) => handleProcedureChange(stn.stationNumber, e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {procedures.map(proc => (
                          <option key={proc.id} value={proc.id}>
                            {proc.name} ({proc.maxMarks} Marks)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Assigned Faculty Examiner
                      </label>
                      <select 
                        value={stn.examinerId} 
                        onChange={(e) => handleExaminerChange(stn.stationNumber, e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {examiners.map(ex => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name} — {ex.designation}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-success">
            <Check size={16} /> Save Configurations
          </button>
        </div>
      </div>
    </div>
  );
}
