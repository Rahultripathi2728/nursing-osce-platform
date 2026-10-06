import React, { useState } from 'react';
import { 
  Shield, 
  Stethoscope, 
  KeyRound, 
  UserCheck, 
  ArrowRight, 
  Lock, 
  Mail,
  AlertCircle,
  Building2
} from 'lucide-react';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';

export default function LoginPortal({ onLoginSuccess }) {
  const [activeMode, setActiveMode] = useState('admin'); // 'admin' | 'examiner'
  
  // Admin form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Examiner form
  const [examinerPin, setExaminerPin] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const exam = storageService.getExam();
  const examiners = storageService.getExaminers();
  const stations = exam.stations || [];

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = authService.loginAdmin(adminEmail, adminPassword);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error);
    }
  };

  const handleExaminerSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const res = authService.loginExaminer(examinerPin);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.error);
    }
  };

  const fillDemoAdmin = () => {
    setAdminEmail('admin@nursing.edu');
    setAdminPassword('admin123');
  };

  const fillDemoExaminer = (pin) => {
    setExaminerPin(pin);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 12px',
      background: 'var(--bg-primary)'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 20px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            margin: '0 auto 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(2, 132, 199, 0.12)',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Stethoscope size={24} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            OSCE<span style={{ color: 'var(--text-muted)' }}>Pulse</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Digital Clinical Examination Portal • INC Competency Standard
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-input)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => {
              setActiveMode('admin');
              setErrorMessage('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeMode === 'admin' ? 'var(--bg-secondary)' : 'transparent',
              color: activeMode === 'admin' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeMode === 'admin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={14} />
            Admin Login
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('examiner');
              setErrorMessage('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeMode === 'examiner' ? 'var(--bg-secondary)' : 'transparent',
              color: activeMode === 'examiner' ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeMode === 'examiner' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={14} />
            Faculty Examiner
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.8rem',
            marginBottom: '18px'
          }}>
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        {activeMode === 'admin' && (
          <form onSubmit={handleAdminSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Admin Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="admin@nursing.edu"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              Sign In to Admin Dashboard <ArrowRight size={15} />
            </button>

            {/* Quick Demo Fill */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '5px 12px' }}
              >
                Auto-fill Demo Credentials (admin@nursing.edu)
              </button>
            </div>
          </form>
        )}

        {/* EXAMINER LOGIN FORM */}
        {activeMode === 'examiner' && (
          <form onSubmit={handleExaminerSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Enter Assigned 4-Digit Faculty PIN or ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. 1101 or FAC-01"
                  value={examinerPin}
                  onChange={(e) => setExaminerPin(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '1px' }}
                  required
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Enter the secret PIN provided by the Exam Coordinator.
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              Access Station Scorecard <ArrowRight size={15} />
            </button>

            {/* Assigned Examiners Quick Roster for testing */}
            <div style={{ marginTop: '22px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Active Station Faculty (Click to Test):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stations.slice(0, 4).map((stn) => {
                  const ex = examiners.find(e => e.id === stn.examinerId);
                  if (!ex) return null;
                  return (
                    <div
                      key={stn.stationNumber}
                      onClick={() => fillDemoExaminer(ex.pin)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>
                        Station {stn.stationNumber}: {ex.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        PIN: {ex.pin}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
