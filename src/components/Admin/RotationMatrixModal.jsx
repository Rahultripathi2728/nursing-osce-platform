import React from 'react';
import { X, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function RotationMatrixModal({ onClose }) {
  const exam = storageService.getExam();
  const stationCount = exam.stationCount || 6;
  const procedures = storageService.getProcedures();
  const matrix = storageService.getRotationMatrix();

  const procedureMap = {};
  procedures.forEach(p => { procedureMap[p.id] = p; });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              boxShadow: '0 0 14px rgba(14, 165, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <RefreshCw size={19} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Circular Ring Rotation Matrix</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Visual permutation matrix for all {stationCount} stations across {matrix.length} rounds
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Matrix Table */}
        <div style={{ padding: '16px 20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Synchronous Ring Shift:</strong> After each central bell chime, candidates advance to the next clockwise station.
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  Round
                </th>
                {Array.from({ length: stationCount }, (_, i) => i + 1).map((stnNum) => {
                  const stnConfig = exam.stations.find(s => s.stationNumber === stnNum);
                  const proc = stnConfig ? procedureMap[stnConfig.procedureId] : null;
                  return (
                    <th key={stnNum} style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                      <div style={{ fontWeight: 700 }}>Station {stnNum}</div>
                      <div style={{ fontSize: '0.7rem', color: '#0284c7', maxWidth: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 auto' }}>
                        {proc ? proc.name : `Stn ${stnNum}`}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => {
                const isCurrent = row.round === (exam.currentRound || 1);
                return (
                  <tr 
                    key={row.round}
                    style={{
                      background: isCurrent ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '12px', fontWeight: 700, color: isCurrent ? '#0284c7' : 'var(--text-secondary)' }}>
                      Round {row.round}
                      {isCurrent && <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: '#059669' }}>(Live)</span>}
                    </td>

                    {Array.from({ length: stationCount }, (_, i) => i + 1).map((stnNum) => {
                      const student = row.stations[stnNum];
                      return (
                        <td key={stnNum} style={{ padding: '12px', textAlign: 'center' }}>
                          {student ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: student.status === 'Absent' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-input)',
                              border: `1px solid ${student.status === 'Absent' ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'}`,
                              fontSize: '0.8rem'
                            }}>
                              <span style={{ fontWeight: 700, color: student.status === 'Absent' ? '#dc2626' : 'var(--text-primary)' }}>
                                #{student.rollNo}
                              </span>
                              <span style={{ color: 'var(--text-secondary)', maxWidth: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {student.name.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
