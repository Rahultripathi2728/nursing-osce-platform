import React, { useState } from 'react';
import { 
  Stethoscope, 
  KeyRound, 
  MapPin, 
  ArrowRight, 
  UserCheck, 
  FileCheck2,
  Clock
} from 'lucide-react';
import ExaminerScoringView from './ExaminerScoringView';
import { storageService } from '../../services/storageService';

export default function ExaminerPortal({ onMarkAbsent }) {
  const exam = storageService.getExam();
  const stations = exam.stations || [];
  const procedures = storageService.getProcedures();
  const examiners = storageService.getExaminers();

  const [selectedStation, setSelectedStation] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleStationClick = (stnNumber) => {
    setSelectedStation(stnNumber);
  };

  const handlePinLogin = (e) => {
    e.preventDefault();
    setPinError('');

    const matchedExaminer = examiners.find(ex => ex.pin === pinInput.trim());
    if (!matchedExaminer) {
      setPinError('Invalid 4-digit PIN. Please verify with Exam Coordinator.');
      return;
    }

    const matchedStation = stations.find(s => s.examinerId === matchedExaminer.id);
    if (!matchedStation) {
      setPinError(`Examiner ${matchedExaminer.name} is not assigned to an active station.`);
      return;
    }

    setSelectedStation(matchedStation.stationNumber);
  };

  // If a station is selected, render the touch-optimized scoring view
  if (selectedStation !== null) {
    return (
      <ExaminerScoringView
        stationNumber={selectedStation}
        onBack={() => setSelectedStation(null)}
        onMarkAbsent={onMarkAbsent}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-live">Live Examination</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Round {exam.currentRound || 1} of {exam.totalRounds || exam.stationCount}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', marginTop: '6px' }}>
              Examiner Station Portal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Select your assigned station or login with your 4-digit faculty PIN to begin candidate assessment.
            </p>
          </div>

          {/* Quick PIN Login Form */}
          <form onSubmit={handlePinLogin} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <KeyRound size={18} color="#0284c7" />
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter Faculty PIN"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                width: '130px',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              Login
            </button>
          </form>
        </div>
        {pinError && (
          <p style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: '8px' }}>
            {pinError}
          </p>
        )}
      </div>

      {/* Stations Selection Grid */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
        Select Station to Open Digital Scorecard ({stations.length} Active Stations)
      </h3>

      <div className="examiner-stations-grid">
        {stations.map((stn) => {
          const proc = procedures.find(p => p.id === stn.procedureId);
          const examiner = examiners.find(e => e.id === stn.examinerId);
          const currentStudent = storageService.getAssignedStudent(stn.stationNumber, exam.currentRound || 1);

          return (
            <div
              key={stn.stationNumber}
              onClick={() => handleStationClick(stn.stationNumber)}
              className="glass-panel"
              style={{
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-live">
                  Station {stn.stationNumber}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Room: {stn.room || 'Skill Lab'}
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {proc ? proc.name : `Station ${stn.stationNumber}`}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <UserCheck size={15} color="#0284c7" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Examiner: <strong style={{ color: 'var(--text-primary)' }}>{examiner ? examiner.name : 'Unassigned'}</strong> (PIN: {examiner?.pin})
                </span>
              </div>

              {/* Active candidate indicator */}
              <div style={{
                background: 'var(--bg-input)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Active Candidate in Round {exam.currentRound || 1}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>
                    {currentStudent ? `#${currentStudent.rollNo} - ${currentStudent.name}` : 'Waiting for student'}
                  </div>
                </div>

                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(2, 132, 199, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7'
                }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
