import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Bell, SkipForward, Clock, AlertTriangle } from 'lucide-react';
import { audioBell } from '../../services/audioBell';

export default function DigitalTimer({ exam, onUpdateExam }) {
  const durationSeconds = (exam.durationMinutes || 5) * 60;
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(exam.status === 'Live');
  const timerRef = useRef(null);
  const warningFiredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    warningFiredRef.current = false;
  }, [exam.durationMinutes, exam.currentRound]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            audioBell.playRotationBell();
            return 0;
          }

          if (prev === 60 && !warningFiredRef.current) {
            warningFiredRef.current = true;
            audioBell.playWarningAlert();
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStartResume = () => {
    setIsRunning(true);
    onUpdateExam({ ...exam, status: 'Live' });
  };

  const handlePause = () => {
    setIsRunning(false);
    onUpdateExam({ ...exam, status: 'Paused' });
  };

  const handleManualRing = () => {
    audioBell.playRotationBell();
  };

  const handleNextRound = () => {
    audioBell.playRotationBell();
    const nextRound = (exam.currentRound || 1) + 1;
    const isFinished = nextRound > (exam.totalRounds || exam.stationCount);

    const updated = {
      ...exam,
      currentRound: isFinished ? exam.totalRounds : nextRound,
      status: isFinished ? 'Completed' : 'Live'
    };
    setTimeLeft(durationSeconds);
    warningFiredRef.current = false;
    onUpdateExam(updated);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = ((durationSeconds - timeLeft) / durationSeconds) * 100;
  const isWarning = timeLeft <= 60 && timeLeft > 0;
  const isZero = timeLeft === 0;

  return (
    <div className="glass-panel" style={{
      padding: '14px 18px',
      marginBottom: '16px',
      border: exam.status === 'Live' ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid var(--border-subtle)',
      background: exam.status === 'Live' ? 'rgba(254, 242, 242, 0.6)' : '#ffffff'
    }}>
      <div className="timer-main-layout" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left: Round Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            background: exam.status === 'Live' ? 'rgba(220, 38, 38, 0.08)' : '#f1f5f9',
            border: exam.status === 'Live' ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: exam.status === 'Live' ? '#dc2626' : '#0284c7',
            flexShrink: 0
          }}>
            <Clock size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '0.98rem', margin: 0, color: 'var(--text-primary)' }}>
                Round {exam.currentRound || 1} of {exam.totalRounds || exam.stationCount}
              </h3>
              <span className={`badge ${exam.status === 'Live' ? 'badge-live' : 'badge-scheduled'}`} style={{ fontSize: '0.62rem' }}>
                {exam.status === 'Live' && <span className="badge-pulse" />}
                {exam.status === 'Live' ? 'LIVE ROTATION' : exam.status || 'SCHEDULED'}
              </span>
            </div>
            <p className="mobile-hide" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              All {exam.stationCount} clinical stations operating in synchronized circular rotation
            </p>
          </div>
        </div>

        {/* Center: Digital Monospaced Countdown */}
        <div className="timer-countdown-box" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isZero ? '#fef2f2' : isWarning ? '#fffbeb' : '#f8fafc',
          padding: '6px 20px',
          borderRadius: 'var(--radius-sm)',
          border: isZero ? '1px solid rgba(220, 38, 38, 0.4)' : isWarning ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid var(--border-subtle)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2.1rem',
              fontWeight: 800,
              letterSpacing: '2.5px',
              color: isZero ? '#dc2626' : isWarning ? '#d97706' : '#0f172a',
            }}>
              {formattedTime}
            </span>
            <div style={{ fontSize: '0.62rem', color: isZero ? '#dc2626' : isWarning ? '#b45309' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
              {isZero ? 'TIME EXPIRED — ROTATION BELL CHIMED' : isWarning ? 'FINAL 60 SECONDS WARNING' : 'STATION ELAPSED TIME'}
            </div>
          </div>
        </div>

        {/* Right: Master Bell & Rotation Controls */}
        <div className="timer-controls-row">
          {!isRunning ? (
            <button
              onClick={handleStartResume}
              className="btn btn-live"
              title="Start / Resume Synchronized Live Examination"
            >
              <Play size={14} />
              <span>{exam.status === 'Paused' ? 'Resume Live' : 'Start Live'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="btn btn-danger"
              title="Pause Live Examination Timer"
            >
              <Pause size={14} />
              <span>Pause Exam</span>
            </button>
          )}

          <button
            onClick={handleManualRing}
            className="btn btn-amber"
            title="Manual Center Bell Chime"
          >
            <Bell size={14} />
            <span>Chime Bell</span>
          </button>

          <button
            onClick={handleNextRound}
            className="btn btn-indigo"
            title="Advance rotation to next round immediately"
          >
            <SkipForward size={14} />
            <span>Rotate (R-{((exam.currentRound || 1) % (exam.stationCount || 6)) + 1})</span>
          </button>
        </div>
      </div>

      {/* Progress Bar under timer */}
      <div style={{
        marginTop: '12px',
        height: '3px',
        borderRadius: '2px',
        background: '#e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: isZero 
            ? '#dc2626' 
            : isWarning 
            ? 'linear-gradient(90deg, #d97706 0%, #dc2626 100%)' 
            : 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)',
          transition: 'width 1s linear'
        }} />
      </div>
    </div>
  );
}
