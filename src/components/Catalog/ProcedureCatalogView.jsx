import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award,
  Layers,
  Search
} from 'lucide-react';
import { PRELOADED_SUBJECTS, PRELOADED_PROCEDURES } from '../../data/preloadedData';

export default function ProcedureCatalogView() {
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedProc, setSelectedProc] = useState(PRELOADED_PROCEDURES[0]);
  const [search, setSearch] = useState('');

  const filteredProcedures = PRELOADED_PROCEDURES.filter(proc => {
    const matchSubject = selectedSubject === 'ALL' || proc.subjectId === selectedSubject;
    const matchSearch = proc.name.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const subjectMap = {};
  PRELOADED_SUBJECTS.forEach(s => { subjectMap[s.id] = s; });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-live">Verified Checklists</span>
              <span className="badge badge-scheduled">INC Competency Curriculum</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', color: 'var(--text-primary)' }}>
              Standardized Clinical Procedure & OSCE Checklist Library
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
              Official step-by-step clinical evaluation rubrics aligned with WHO, Indian Nursing Council (INC), and Mission Niramaya (UPSMF/Jhpiego).
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            minWidth: '260px'
          }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search procedure name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setSelectedSubject('ALL')}
            className="btn btn-outline"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderColor: selectedSubject === 'ALL' ? '#0284c7' : 'var(--border-subtle)',
              background: selectedSubject === 'ALL' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
              color: selectedSubject === 'ALL' ? '#0284c7' : 'var(--text-secondary)'
            }}
          >
            All Subjects ({PRELOADED_PROCEDURES.length})
          </button>
          {PRELOADED_SUBJECTS.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className="btn btn-outline"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                borderColor: selectedSubject === sub.id ? sub.color : 'var(--border-subtle)',
                background: selectedSubject === sub.id ? `${sub.color}25` : 'transparent',
                color: selectedSubject === sub.id ? sub.color : 'var(--text-secondary)'
              }}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Procedure List + Full Rubric Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '24px' }}>
        {/* Left Column: Procedure List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredProcedures.map(proc => {
            const isSelected = selectedProc?.id === proc.id;
            const sub = subjectMap[proc.subjectId];

            return (
              <div
                key={proc.id}
                onClick={() => setSelectedProc(proc)}
                className="glass-panel"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${sub ? sub.color : '#0284c7'}`,
                  borderColor: isSelected ? '#0284c7' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-surface)'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: sub?.color || '#0284c7', fontWeight: 600, marginBottom: '4px' }}>
                  {sub?.name}
                </div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {proc.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {proc.defaultDurationSeconds / 60} Mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={13} /> {proc.maxMarks} Marks
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={13} /> {proc.steps.length} Steps
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Procedure Checklist Rubric */}
        {selectedProc && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-live" style={{ marginBottom: '6px' }}>
                  {subjectMap[selectedProc.subjectId]?.name}
                </span>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  {selectedProc.name}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="badge badge-scheduled">Station: {selectedProc.stationType}</span>
                <span className="badge badge-live">Max: {selectedProc.maxMarks} Marks</span>
                <span className="badge badge-scheduled">Time: {selectedProc.defaultDurationSeconds / 60} Minutes</span>
              </div>
            </div>

            {/* Red Flag Box */}
            {selectedProc.redFlag && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={20} color="#f43f5e" />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e' }}>
                    Critical Safety Breach (Red Flag):
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {selectedProc.redFlag}
                  </div>
                </div>
              </div>
            )}

            {/* Steps Table */}
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Standard Step-by-Step Scoring Rubric ({selectedProc.steps.length} Competency Steps)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedProc.steps.map((step, idx) => (
                <div
                  key={step.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(2, 132, 199, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {step.phase}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {step.text}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    flexShrink: 0
                  }}>
                    {step.marks} Pts
                  </div>
                </div>
              ))}
            </div>

            {/* Official Source Footnote */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Source Standard: Indian Nursing Council (INC) Competency Manual • Mission Niramaya (UPSMF/Jhpiego) • WHO Patient Safety Standards
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
