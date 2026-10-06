import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserX, 
  Sparkles, 
  Send, 
  Check, 
  FileText,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Clock
} from 'lucide-react';
import { audioBell } from '../../services/audioBell';
import { storageService } from '../../services/storageService';

export default function ExaminerScoringView({ 
  stationNumber, 
  onBack, 
  onMarkAbsent 
}) {
  const exam = storageService.getExam();
  const currentRound = exam.currentRound || 1;
  const procedures = storageService.getProcedures();
  const examiners = storageService.getExaminers();

  const stnConfig = exam.stations.find(s => s.stationNumber === stationNumber);
  const procedure = procedures.find(p => p.id === (stnConfig ? stnConfig.procedureId : null)) || procedures[0];
  const examiner = examiners.find(e => e.id === (stnConfig ? stnConfig.examinerId : null)) || examiners[0];

  // Get active student assigned to this station in the current round
  const currentStudent = storageService.getAssignedStudent(stationNumber, currentRound);

  // Scores state: { [stepId]: 0 | 1 | 2 }
  const [scores, setScores] = useState({});
  const [hasRedFlag, setHasRedFlag] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [verifiedCandidate, setVerifiedCandidate] = useState(false);

  // Load existing evaluation if already scored in this round
  useEffect(() => {
    if (currentStudent) {
      const evalKey = `STN_${stationNumber}_STU_${currentStudent.id}`;
      const allEvals = storageService.getEvaluations();
      const existing = allEvals[evalKey];

      if (existing) {
        setScores(existing.stepScores || {});
        setHasRedFlag(existing.hasRedFlag || false);
        setRemarks(existing.remarks || '');
        setIsSubmitted(true);
        setVerifiedCandidate(true);
      } else {
        setScores({});
        setHasRedFlag(false);
        setRemarks('');
        setIsSubmitted(false);
        setVerifiedCandidate(false);
      }
    }
  }, [stationNumber, currentRound, currentStudent?.id]);

  const handleScoreChange = (stepId, value) => {
    if (isSubmitted) return;
    setScores(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleAutofillAll = () => {
    if (isSubmitted) return;
    const filled = {};
    procedure.steps.forEach(step => {
      filled[step.id] = 2;
    });
    setScores(filled);
  };

  const handleClearAll = () => {
    if (isSubmitted) return;
    setScores({});
  };

  // Calculate live running score
  let currentTotal = 0;
  procedure.steps.forEach(step => {
    const val = scores[step.id];
    if (val === 2) currentTotal += step.marks;
    else if (val === 1) currentTotal += Math.round(step.marks / 2);
  });
  if (hasRedFlag) {
    currentTotal = Math.min(currentTotal, Math.round(procedure.maxMarks * 0.4));
  }

  const handleSubmit = () => {
    if (!currentStudent) return;
    audioBell.playSuccessSound();

    const evaluationData = {
      round: currentRound,
      stationNumber,
      studentId: currentStudent.id,
      studentRoll: currentStudent.rollNo,
      studentName: currentStudent.name,
      procedureId: procedure.id,
      procedureName: procedure.name,
      examinerId: examiner.id,
      examinerName: examiner.name,
      stepScores: scores,
      totalScore: currentTotal,
      maxScore: procedure.maxMarks,
      hasRedFlag,
      remarks,
      isAbsent: false,
      submittedAt: new Date().toISOString()
    };

    storageService.saveEvaluation(stationNumber, currentStudent.id, evaluationData);
    setIsSubmitted(true);
  };

  if (!currentStudent) {
    return (
      <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }}>
        <Clock size={36} color="var(--text-muted)" style={{ margin: '0 auto 14px' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Station {stationNumber} Waiting for Candidate
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          No candidate is currently allocated to this station in Round {currentRound}. When the central bell chimes or a candidate arrives, their card will appear automatically.
        </p>
        {onBack && (
          <button onClick={onBack} className="btn btn-outline">
            <ArrowLeft size={14} /> Return
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '940px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Station Header */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBack && (
              <button onClick={onBack} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
                <ArrowLeft size={15} />
              </button>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-live">Station {stationNumber}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Room: {stnConfig?.room || 'Clinical Lab'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {procedure.name}
              </h2>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Faculty Examiner</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{examiner.name}</div>
          </div>
        </div>
      </div>

      {/* Candidate Verification Card */}
      <div className="glass-card-elevated" style={{ padding: '16px 18px', marginBottom: '16px' }}>
        <div className="candidate-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(2, 132, 199, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              flexShrink: 0
            }}>
              #{currentStudent.rollNo}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{currentStudent.name}</h3>
                <span className="badge badge-scheduled" style={{ fontSize: '0.65rem' }}>{currentStudent.prn}</span>
                {verifiedCandidate && (
                  <span className="badge badge-live" style={{ fontSize: '0.65rem' }}>
                    <Check size={11} /> Verified
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Father's Name: <strong style={{ color: 'var(--text-primary)' }}>{currentStudent.fatherName || '—'}</strong> • {currentStudent.semester || 'Semester II'}
              </div>
            </div>
          </div>

          <div className="candidate-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!verifiedCandidate ? (
              <button 
                onClick={() => setVerifiedCandidate(true)} 
                className="btn btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                <CheckCircle2 size={14} /> Verify & Begin
              </button>
            ) : (
              <span className="mobile-hide" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Candidate Verified
              </span>
            )}

            {!isSubmitted && (
              <button 
                onClick={() => onMarkAbsent(currentStudent, stationNumber)} 
                className="btn btn-danger"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                <UserX size={13} /> Mark Absent
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Scoring Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        padding: '0 2px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Evaluation Rubric ({procedure.steps.length} Steps)
          </span>
          <span className="badge badge-scheduled" style={{ fontSize: '0.65rem' }}>Max: {procedure.maxMarks}M</span>
        </div>

        {!isSubmitted && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleAutofillAll} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
              <Sparkles size={12} /> Auto 2s
            </button>
            <button onClick={handleClearAll} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        {procedure.steps.map((step, idx) => {
          const currentVal = scores[step.id];

          return (
            <div 
              key={step.id} 
              className="glass-panel" 
              style={{
                padding: '12px 14px',
                borderLeft: `3px solid ${currentVal === 2 ? 'var(--accent-cyan)' : currentVal === 1 ? '#94a3b8' : currentVal === 0 ? '#ef4444' : 'var(--border-subtle)'}`
              }}
            >
              <div className="step-card-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: '1 1 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      Step {idx + 1}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '2px 5px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-secondary)'
                    }}>
                      {step.phase}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      ({step.marks}M)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {step.text}
                  </p>
                </div>

                {/* Monochrome Touch Score Pills */}
                <div className="step-score-container">
                  <button
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleScoreChange(step.id, 0)}
                    className="step-score-btn"
                    style={{
                      cursor: isSubmitted ? 'default' : 'pointer',
                      background: currentVal === 0 ? '#ef4444' : 'transparent',
                      color: currentVal === 0 ? '#ffffff' : 'var(--text-muted)'
                    }}
                  >
                    0 • Not Done
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleScoreChange(step.id, 1)}
                    className="step-score-btn"
                    style={{
                      cursor: isSubmitted ? 'default' : 'pointer',
                      background: currentVal === 1 ? '#e2e8f0' : 'transparent',
                      color: currentVal === 1 ? '#0f172a' : 'var(--text-muted)'
                    }}
                  >
                    1 • Partial
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => handleScoreChange(step.id, 2)}
                    className="step-score-btn"
                    style={{
                      cursor: isSubmitted ? 'default' : 'pointer',
                      fontWeight: 700,
                      background: currentVal === 2 ? 'var(--accent-cyan)' : 'transparent',
                      color: currentVal === 2 ? '#ffffff' : 'var(--text-muted)'
                    }}
                  >
                    2 • Done
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Red Flag Safety Toggle */}
      <div className="glass-panel" style={{
        padding: '12px 14px',
        marginBottom: '16px',
        border: hasRedFlag ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
        background: hasRedFlag ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <AlertTriangle size={18} color={hasRedFlag ? '#ef4444' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: hasRedFlag ? '#ef4444' : 'var(--text-primary)' }}>
                Critical Safety Breach (Red Flag)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {procedure.redFlag || 'Severe violation of sterile technique or safety protocol'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitted}
            onClick={() => {
              if (!hasRedFlag) audioBell.playRedFlagAlert();
              setHasRedFlag(!hasRedFlag);
            }}
            className={hasRedFlag ? 'btn btn-danger' : 'btn btn-outline'}
            style={{ fontSize: '0.72rem', padding: '6px 10px', flexShrink: 0 }}
          >
            {hasRedFlag ? '🚩 RED FLAG ACTIVE' : 'Trigger Red Flag'}
          </button>
        </div>
      </div>

      {/* Remarks */}
      <div className="glass-panel" style={{ padding: '14px 16px', marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
          Examiner Feedback & Observation Remarks
        </label>
        <textarea
          disabled={isSubmitted}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="e.g. Good landmarking, slight hesitation on draping..."
          rows={2}
          className="form-textarea"
        />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky-bottom-bar" style={{
        position: 'sticky',
        bottom: '12px',
        zIndex: 50,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              {currentTotal}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              / {procedure.maxMarks}M
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ({((currentTotal / procedure.maxMarks) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        <div>
          {isSubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-live" style={{ fontSize: '0.72rem' }}>
                <CheckCircle2 size={12} /> Locked
              </span>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="btn btn-outline"
                style={{ fontSize: '0.72rem', padding: '5px 8px' }}
              >
                Edit
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.82rem' }}
            >
              <Send size={14} /> Submit Evaluation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
