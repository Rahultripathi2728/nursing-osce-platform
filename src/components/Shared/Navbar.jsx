import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Stethoscope, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Database, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { audioBell } from '../../services/audioBell';
import { firebaseService } from '../../services/firebase';

export default function Navbar({ currentUser, onLogout, onOpenFirebase }) {
  const [soundOn, setSoundOn] = useState(audioBell.isSoundEnabled());
  const [isFirebaseLive, setIsFirebaseLive] = useState(firebaseService.isConfigured());

  useEffect(() => {
    const checkInterval = setInterval(() => {
      setIsFirebaseLive(firebaseService.isConfigured());
    }, 2500);
    return () => clearInterval(checkInterval);
  }, []);

  const handleToggleSound = () => {
    const newState = audioBell.toggleSound();
    setSoundOn(newState);
    if (newState) {
      audioBell.playSuccessSound();
    }
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '56px',
        paddingTop: '8px',
        paddingBottom: '8px',
        gap: '8px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
            border: '1px solid #0284c7',
            flexShrink: 0
          }}>
            <Stethoscope size={19} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap'
            }}>
              OSCE<span style={{ color: '#0284c7' }}>Pulse</span>
            </span>
            <span className="badge badge-cyan mobile-hide" style={{ fontSize: '0.62rem' }}>
              INC B.SC. NURSING
            </span>
          </div>
        </div>

        {/* Current User Session Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {currentUser?.role === 'admin' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                fontSize: '0.75rem'
              }}>
                <Shield size={13} color="#4f46e5" />
                <span className="mobile-hide" style={{ color: '#4338ca', fontWeight: 600 }}>Academic Controller</span>
                <span className="mobile-only" style={{ color: '#4338ca', fontWeight: 600 }}>Admin</span>
              </div>

              {/* Firebase Cloud Sync Button */}
              <button
                onClick={onOpenFirebase}
                className="btn btn-outline"
                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                title="Firebase Cloud Sync Settings"
              >
                <Database size={13} color={isFirebaseLive ? '#059669' : 'var(--text-muted)'} />
                <span className="mobile-hide">{isFirebaseLive ? 'Firebase Active' : 'Local Engine'}</span>
              </button>
            </div>
          ) : currentUser?.role === 'examiner' ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem'
            }}>
              <UserCheck size={13} color="#0f172a" />
              <span style={{ color: '#0f172a', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </span>
              <span className="badge badge-live" style={{ padding: '2px 5px', fontSize: '0.65rem' }}>
                Stn {currentUser.stationNumber}
              </span>
            </div>
          ) : null}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Digital Bell Audio Enabled' : 'Bell Audio Muted'}
            className="btn btn-outline btn-icon"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            {soundOn ? <Volume2 size={14} color="#0f172a" /> : <VolumeX size={14} color="var(--text-muted)" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="btn btn-outline"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
            title="Sign out of system"
          >
            <LogOut size={13} />
            <span className="mobile-hide">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
