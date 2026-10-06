import React, { useState } from 'react';
import { UserX, AlertTriangle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function AbsenteeModal({ student, stationNumber, onClose, onConfirm }) {
  const [resolutionMode, setResolutionMode] = useState('DYNAMIC_BUFFER');
  const [reason, setReason] = useState('Unreported / Absent at station check');

  if (!student) return null;

  const handleConfirm = () => {
    storageService.markStudentAbsent(student.id, stationNumber);
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <UserX size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Mark Candidate Absent</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Station {stationNumber} • Real-time Queue Rebalancing
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Roll #{student.rollNo} — {student.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                PRN: {student.prn} • Candidate not reported at Station {stationNumber}
              </div>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Select Queue Rebalancing Strategy:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {/* Mode A: Dynamic Buffer */}
            <div
              onClick={() => setResolutionMode('DYNAMIC_BUFFER')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${resolutionMode === 'DYNAMIC_BUFFER' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                background: resolutionMode === 'DYNAMIC_BUFFER' ? 'var(--bg-surface)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Option A: Dynamic Buffer (Recommended)
                </span>
                {resolutionMode === 'DYNAMIC_BUFFER' && (
                  <span className="badge badge-live" style={{ fontSize: '0.62rem' }}>Selected</span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Immediately pulls the next waiting candidate into Station {stationNumber} so the station examiner does not remain idle.
              </p>
            </div>

            {/* Mode B: Smart Shift */}
            <div
              onClick={() => setResolutionMode('SMART_PAUSE')}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${resolutionMode === 'SMART_PAUSE' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                background: resolutionMode === 'SMART_PAUSE' ? 'var(--bg-surface)' : 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Option B: Smart Station Break
                </span>
                {resolutionMode === 'SMART_PAUSE' && (
                  <span className="badge badge-live" style={{ fontSize: '0.62rem' }}>Selected</span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Marks candidate Absent (0 marks). Station {stationNumber} serves as a sanitization break this round. Other stations continue uninterrupted.
              </p>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Reason for Absence:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="form-input"
            style={{ marginBottom: '20px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={onClose} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              Cancel
            </button>
            <button onClick={handleConfirm} className="btn btn-danger" style={{ fontSize: '0.8rem' }}>
              <UserX size={14} /> Confirm Absentee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
