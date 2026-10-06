import React, { useState, useEffect } from 'react';
import Navbar from './components/Shared/Navbar';
import DigitalTimer from './components/Shared/DigitalTimer';
import AdminDashboard from './components/Admin/AdminDashboard';
import ExaminerScoringView from './components/Examiner/ExaminerScoringView';
import LoginPortal from './components/Auth/LoginPortal';
import RotationMatrixModal from './components/Admin/RotationMatrixModal';
import FirebaseConfigModal from './components/Admin/FirebaseConfigModal';
import ResultSummaryModal from './components/Admin/ResultSummaryModal';
import AbsenteeModal from './components/Admin/AbsenteeModal';
import { authService } from './services/authService';
import { storageService } from './services/storageService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [exam, setExam] = useState(storageService.getExam());

  // Modals state
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [absenteeTarget, setAbsenteeTarget] = useState(null); // { student, stationNumber }

  // Subscribe to real-time events across browser tabs
  useEffect(() => {
    const unsubscribe = storageService.subscribe((event) => {
      const freshExam = storageService.getExam();
      setExam(freshExam);

      // If logged in as examiner, ensure stationNumber stays in sync with any admin reassignments
      const user = authService.getCurrentUser();
      if (user && user.role === 'examiner') {
        const assignedStation = (freshExam.stations || []).find(s => s.examinerId === user.id);
        if (assignedStation && assignedStation.stationNumber !== user.stationNumber) {
          const updatedUser = {
            ...user,
            stationNumber: assignedStation.stationNumber,
            isAssigned: true
          };
          authService.setCurrentUser(updatedUser);
          setCurrentUser(updatedUser);
        }
      }
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleUpdateExam = (updated) => {
    setExam(updated);
    storageService.saveExam(updated);
  };

  const handleOpenAbsentee = (student, stationNumber) => {
    setAbsenteeTarget({ student, stationNumber });
  };

  // --- 1. IF NOT LOGGED IN -> RENDER DEDICATED LOGIN PORTAL ---
  if (!currentUser) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  // --- 2. IF LOGGED IN -> RENDER ROLE-SPECIFIC APPLICATION ---
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenFirebase={() => setShowFirebaseModal(true)}
      />

      {/* Main Container */}
      <main className="container" style={{ flex: 1, paddingTop: '20px' }}>
        {/* EXAMINER ROLE: Displays Only Their Station & Live Scoring */}
        {currentUser.role === 'examiner' ? (
          <div>
            <DigitalTimer exam={exam} onUpdateExam={handleUpdateExam} />
            <ExaminerScoringView
              stationNumber={currentUser.stationNumber}
              onMarkAbsent={handleOpenAbsentee}
            />
          </div>
        ) : (
          /* ADMIN ROLE: Displays Complete Admin Management Console */
          <AdminDashboard
            exam={exam}
            onUpdateExam={handleUpdateExam}
            onOpenRotation={() => setShowRotationModal(true)}
            onOpenResults={() => setShowResultsModal(true)}
            onOpenAbsentee={handleOpenAbsentee}
          />
        )}
      </main>

      {/* Minimal Monochrome Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '14px 0',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container">
          OSCEPulse Clinical Examination System • Indian Nursing Council (INC) & WHO Competency Standards
        </div>
      </footer>

      {/* Global Modals */}
      {showRotationModal && (
        <RotationMatrixModal onClose={() => setShowRotationModal(false)} />
      )}

      {showFirebaseModal && (
        <FirebaseConfigModal onClose={() => setShowFirebaseModal(false)} />
      )}

      {showResultsModal && (
        <ResultSummaryModal onClose={() => setShowResultsModal(false)} />
      )}

      {absenteeTarget && (
        <AbsenteeModal
          student={absenteeTarget.student}
          stationNumber={absenteeTarget.stationNumber}
          onClose={() => setAbsenteeTarget(null)}
          onConfirm={() => {
            setExam(storageService.getExam());
          }}
        />
      )}
    </div>
  );
}
