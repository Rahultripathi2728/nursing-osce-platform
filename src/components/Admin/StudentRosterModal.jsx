import React, { useState } from 'react';
import { X, Users, UserPlus, Search, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function StudentRosterModal({ onClose, onUpdate }) {
  const [students, setStudents] = useState(storageService.getStudents());
  const [search, setSearch] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrn, setNewPrn] = useState('');
  const [newGender, setNewGender] = useState('Female');
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newRoll.trim() || !newName.trim()) return;

    const newStudent = {
      id: `STU-${Date.now()}`,
      rollNo: newRoll.trim(),
      name: newName.trim(),
      prn: newPrn.trim() || `BScN-2024-${newRoll.trim()}`,
      gender: newGender,
      status: 'Present'
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    storageService.saveStudents(updated);
    setNewRoll('');
    setNewName('');
    setNewPrn('');
    setShowAddForm(false);
    if (onUpdate) onUpdate();
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n');
    const newItems = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        newItems.push({
          id: `STU-${Date.now()}-${idx}`,
          rollNo: parts[0],
          name: parts[1],
          prn: parts[2] || `BScN-2024-${parts[0]}`,
          gender: parts[3] || 'Female',
          status: 'Present'
        });
      }
    });

    if (newItems.length > 0) {
      const updated = [...students, ...newItems];
      setStudents(updated);
      storageService.saveStudents(updated);
      setBulkText('');
      setShowBulkPaste(false);
      if (onUpdate) onUpdate();
    }
  };

  const toggleStatus = (id) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Absent' ? 'Present' : 'Absent' };
      }
      return s;
    });
    setStudents(updated);
    storageService.saveStudents(updated);
    if (onUpdate) onUpdate();
  };

  const filtered = students.filter(s => 
    s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.prn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Candidate Roster & Attendance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {students.length} Total Registered Students • {students.filter(s => s.status !== 'Absent').length} Present
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search by Roll No or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
              <UserPlus size={15} /> Add Candidate
            </button>
            <button onClick={() => setShowBulkPaste(!showBulkPaste)} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
              <FileSpreadsheet size={15} /> Bulk CSV
            </button>
          </div>
        </div>

        {/* Add Student Form */}
        {showAddForm && (
          <form onSubmit={handleAddStudent} style={{ padding: '16px 24px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#0284c7' }}>Register Single Student</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <input type="text" placeholder="Roll No (e.g. 19)" value={newRoll} onChange={e => setNewRoll(e.target.value)} className="form-input" required />
              <input type="text" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} className="form-input" required />
              <input type="text" placeholder="PRN Number" value={newPrn} onChange={e => setNewPrn(e.target.value)} className="form-input" />
              <select value={newGender} onChange={e => setNewGender(e.target.value)} className="form-select">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
              <button type="submit" className="btn btn-success" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Save Student</button>
            </div>
          </form>
        )}

        {/* Bulk CSV Paste Area */}
        {showBulkPaste && (
          <div style={{ padding: '16px 24px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '6px', color: '#0284c7' }}>Bulk Paste CSV Format: Roll, Name, PRN, Gender</h4>
            <textarea
              rows={4}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="19, Sneha Patil, BScN-2024-019, Female&#10;20, Aman Verma, BScN-2024-020, Male"
              className="form-textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowBulkPaste(false)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
              <button type="button" onClick={handleBulkAdd} className="btn btn-success" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>Import CSV Candidates</button>
            </div>
          </div>
        )}

        {/* Student Table */}
        <div style={{ padding: '16px 24px', maxHeight: '420px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Roll #</th>
                <th style={{ padding: '8px 12px' }}>Student Name</th>
                <th style={{ padding: '8px 12px' }}>PRN</th>
                <th style={{ padding: '8px 12px' }}>Attendance</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0284c7' }}>
                    #{student.rollNo}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {student.name}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {student.prn}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${student.status === 'Absent' ? 'badge-danger' : 'badge-live'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleStatus(student.id)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      {student.status === 'Absent' ? 'Mark Present' : 'Mark Absent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
