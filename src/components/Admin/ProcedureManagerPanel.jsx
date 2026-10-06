import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Award, 
  AlertTriangle,
  Layers,
  Search,
  CheckCircle2
} from 'lucide-react';
import { PRELOADED_SUBJECTS } from '../../data/preloadedData';
import { storageService } from '../../services/storageService';

export default function ProcedureManagerPanel() {
  const [procedures, setProcedures] = useState(storageService.getProcedures());
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedProc, setSelectedProc] = useState(procedures[0] || null);

  // Modal State for Edit / Create Checklist
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    subjectId: 'NF',
    name: '',
    semester: 'Semester II',
    defaultDurationSeconds: 300,
    stationType: 'Manned',
    redFlag: '',
    steps: []
  });

  const subjectMap = {};
  PRELOADED_SUBJECTS.forEach(s => { subjectMap[s.id] = s; });

  const refreshList = () => {
    const list = storageService.getProcedures();
    setProcedures(list);
    if (selectedProc) {
      const updated = list.find(p => p.id === selectedProc.id);
      setSelectedProc(updated || list[0] || null);
    }
  };

  const openCreateModal = () => {
    setIsCreatingNew(true);
    setFormData({
      id: `PROC-CUSTOM-${Date.now()}`,
      subjectId: 'NF',
      name: '',
      semester: 'Semester II',
      defaultDurationSeconds: 300,
      stationType: 'Manned',
      redFlag: '',
      steps: [
        { id: 1, phase: 'Preparation', text: 'Verified patient identity, explained procedure, and obtained informed consent', marks: 2 },
        { id: 2, phase: 'Preparation', text: 'Performed WHO hand hygiene and prepared sterile/clean equipment', marks: 2 },
        { id: 3, phase: 'Execution', text: 'Executed primary clinical procedure adhering strictly to aseptic technique', marks: 4 },
        { id: 4, phase: 'Post-Procedure', text: 'Disposed biomedical waste according to color codes and documented observations', marks: 2 }
      ]
    });
    setShowEditModal(true);
  };

  const openEditModal = (proc) => {
    setIsCreatingNew(false);
    setFormData({
      ...proc,
      steps: proc.steps ? JSON.parse(JSON.stringify(proc.steps)) : []
    });
    setShowEditModal(true);
  };

  const handleDeleteProcedure = (procId) => {
    if (window.confirm('Delete this procedure checklist from library?')) {
      const updated = storageService.deleteProcedure(procId);
      setProcedures(updated);
      setSelectedProc(updated[0] || null);
    }
  };

  // Step editing handlers
  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: field === 'marks' ? Number(value) : value
    };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleAddStep = () => {
    const newStep = {
      id: Date.now(),
      phase: 'Execution',
      text: '',
      marks: 2
    };
    setFormData({ ...formData, steps: [...formData.steps, newStep] });
  };

  const handleDeleteStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSaveChecklist = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Calculate total max marks
    const calculatedTotal = formData.steps.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);

    const procedureToSave = {
      ...formData,
      maxMarks: calculatedTotal || 20,
      steps: formData.steps
    };

    storageService.saveProcedure(procedureToSave);
    refreshList();
    setSelectedProc(procedureToSave);
    setShowEditModal(false);
  };

  const filtered = procedures.filter(proc => {
    const matchSubject = selectedSubject === 'ALL' || proc.subjectId === selectedSubject;
    const matchSearch = proc.name.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const [mobileViewDetail, setMobileViewDetail] = useState(false);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Clinical Procedures & Checklists</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Inspect rubrics, adjust step marks, and build OSCE checklists
            </p>
          </div>

          <button onClick={openCreateModal} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
            <Plus size={14} /> New Checklist
          </button>
        </div>

        {/* Search & Subject Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
          <div className="mobile-scroll-x" style={{ display: 'flex', gap: '6px', paddingBottom: '2px', flex: '1 1 300px' }}>
            <button
              onClick={() => setSelectedSubject('ALL')}
              className="btn btn-outline"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                flexShrink: 0,
                borderColor: selectedSubject === 'ALL' ? '#0284c7' : 'var(--border-subtle)',
                background: selectedSubject === 'ALL' ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                color: selectedSubject === 'ALL' ? '#0284c7' : 'var(--text-secondary)',
                fontWeight: selectedSubject === 'ALL' ? 700 : 500
              }}
            >
              All ({procedures.length})
            </button>
            {PRELOADED_SUBJECTS.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className="btn btn-outline"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  flexShrink: 0,
                  borderColor: selectedSubject === sub.id ? '#0284c7' : 'var(--border-subtle)',
                  background: selectedSubject === sub.id ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                  color: selectedSubject === sub.id ? '#0284c7' : 'var(--text-secondary)',
                  fontWeight: selectedSubject === sub.id ? 700 : 500
                }}
              >
                {sub.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            minWidth: '200px',
            flex: '1 1 200px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search procedure..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="proc-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '16px' }}>
        {/* Left: Procedure List (hidden on mobile if inspecting detail) */}
        <div className={mobileViewDetail ? 'mobile-hide' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(proc => {
            const isSelected = selectedProc?.id === proc.id;
            const sub = subjectMap[proc.subjectId];

            return (
              <div
                key={proc.id}
                onClick={() => {
                  setSelectedProc(proc);
                  setMobileViewDetail(true);
                }}
                className="glass-panel"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#0284c7' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                    {sub?.name || 'Nursing'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {proc.maxMarks} Marks
                  </span>
                </div>

                <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {proc.name}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="#0284c7" /> {Math.round(proc.defaultDurationSeconds / 60)} Mins
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={12} color="#4f46e5" /> {proc.steps?.length || 0} Steps
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Checklist View & Actions */}
        {selectedProc ? (
          <div className={!mobileViewDetail ? 'mobile-hide' : ''} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Mobile Back Button to return to list */}
            <div className="mobile-only" style={{ marginBottom: '10px' }}>
              <button
                onClick={() => setMobileViewDetail(false)}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                ← Back to Procedure List
              </button>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <span className="badge badge-indigo" style={{ marginBottom: '6px', fontSize: '0.65rem' }}>
                    {subjectMap[selectedProc.subjectId]?.name} • {selectedProc.semester || 'Semester II'}
                  </span>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedProc.name}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => openEditModal(selectedProc)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <Edit3 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDeleteProcedure(selectedProc.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Overview Stats */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>Score: <strong style={{ color: '#0284c7' }}>{selectedProc.maxMarks}M</strong></span>
                <span>•</span>
                <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{Math.round(selectedProc.defaultDurationSeconds / 60)} Mins</strong></span>
                <span>•</span>
                <span>Type: <strong style={{ color: '#059669' }}>{selectedProc.stationType || 'Manned'}</strong></span>
              </div>

              {/* Red Flag Box */}
              {selectedProc.redFlag && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: '#991b1b' }}>
                    <strong style={{ color: '#dc2626' }}>Critical Safety Red Flag:</strong> {selectedProc.redFlag}
                  </div>
                </div>
              )}

              {/* Steps List */}
              <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                Checklist Evaluation Steps ({selectedProc.steps?.length || 0})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedProc.steps?.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#0284c7', width: '22px', flexShrink: 0, fontWeight: 700 }}>
                        {idx + 1}.
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '0.62rem', color: '#4f46e5', textTransform: 'uppercase', marginRight: '6px', fontWeight: 600 }}>
                          [{step.phase}]
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {step.text}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '2px 8px', borderRadius: '4px', flexShrink: 0 }}>
                      {step.marks}M
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* --- EDIT / CREATE CHECKLIST MODAL --- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {isCreatingNew ? 'Create New Procedure Checklist' : 'Edit Procedure Checklist & Rubric'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-outline btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveChecklist} style={{ padding: '20px' }}>
              <div className="modal-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Procedure Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tracheostomy Suctioning & Care"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Clinical Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="form-select"
                  >
                    {PRELOADED_SUBJECTS.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Academic Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="form-select"
                  >
                    {[
                      'Semester I', 'Semester II', 'Semester III', 'Semester IV',
                      'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'
                    ].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Station Duration
                  </label>
                  <select
                    value={Math.round(formData.defaultDurationSeconds / 60)}
                    onChange={(e) => setFormData({ ...formData, defaultDurationSeconds: Number(e.target.value) * 60 })}
                    className="form-select"
                  >
                    {[3, 4, 5, 6, 7, 8, 10].map(m => (
                      <option key={m} value={m}>{m} Minutes</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Calculated Max Score
                  </label>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                    {formData.steps.reduce((sum, s) => sum + (Number(s.marks) || 0), 0)} Marks
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Critical Safety Violation (Red Flag Trigger)
                </label>
                <input
                  type="text"
                  value={formData.redFlag}
                  onChange={(e) => setFormData({ ...formData, redFlag: e.target.value })}
                  placeholder="e.g. Breaching sterile field or wrong drug administration"
                  className="form-input"
                />
              </div>

              {/* Step Editor Table */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Checklist Evaluation Steps ({formData.steps.length})
                  </label>
                  <button type="button" onClick={handleAddStep} className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                    <Plus size={12} /> Add Step
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {formData.steps.map((step, idx) => (
                    <div key={idx} className="proc-step-edit-row" style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr 70px 32px',
                      gap: '8px',
                      alignItems: 'center',
                      background: 'var(--bg-input)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <select
                        value={step.phase}
                        onChange={(e) => handleStepChange(idx, 'phase', e.target.value)}
                        className="form-select"
                        style={{ padding: '6px 8px', fontSize: '0.72rem' }}
                      >
                        <option value="Preparation">Preparation</option>
                        <option value="Execution">Execution</option>
                        <option value="Post-Procedure">Post-Proc</option>
                      </select>

                      <input
                        type="text"
                        value={step.text}
                        onChange={(e) => handleStepChange(idx, 'text', e.target.value)}
                        placeholder="Step description..."
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        required
                      />

                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={step.marks}
                        onChange={(e) => handleStepChange(idx, 'marks', e.target.value)}
                        className="form-input"
                        style={{ padding: '6px 6px', fontSize: '0.8rem', textAlign: 'center' }}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => handleDeleteStep(idx)}
                        className="btn btn-outline btn-icon"
                        style={{ width: '28px', height: '28px', color: '#ef4444' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={15} /> Save Checklist Rubric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
