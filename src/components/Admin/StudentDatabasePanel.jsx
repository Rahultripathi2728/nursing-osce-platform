import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Check, 
  X,
  ArrowUpDown
} from 'lucide-react';
import { storageService } from '../../services/storageService';

const SEMESTER_OPTIONS = [
  'All Semesters',
  'Odd Semesters (1, 3, 5, 7)',
  'Even Semesters (2, 4, 6, 8)',
  'Semester I',
  'Semester II',
  'Semester III',
  'Semester IV',
  'Semester V',
  'Semester VI',
  'Semester VII',
  'Semester VIII'
];

export default function StudentDatabasePanel() {
  const [students, setStudents] = useState(storageService.getStudents());
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [search, setSearch] = useState('');

  // Add / Edit Modal state
  const [editingStudent, setEditingStudent] = useState(null); // null for new, object for edit
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    serialNo: '',
    rollNo: '',
    name: '',
    fatherName: '',
    semester: 'Semester II',
    academicYear: '2025-2026',
    prn: '',
    gender: 'Female',
    status: 'Present'
  });

  // Bulk CSV state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');

  const refreshList = () => {
    setStudents(storageService.getStudents());
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      serialNo: students.length + 1,
      rollNo: String(students.length + 1).padStart(2, '0'),
      name: '',
      fatherName: '',
      semester: selectedSemester.startsWith('Semester') ? selectedSemester : 'Semester II',
      academicYear: '2025-2026',
      prn: `BScN-2024-${String(students.length + 1).padStart(3, '0')}`,
      gender: 'Female',
      status: 'Present'
    });
    setShowModal(true);
  };

  const openEditModal = (stu) => {
    setEditingStudent(stu);
    setFormData({ ...stu });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this candidate from database?')) {
      const updated = storageService.deleteStudent(id);
      setStudents(updated);
    }
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.rollNo.trim()) return;

    const studentToSave = {
      id: editingStudent ? editingStudent.id : `STU-${Date.now()}`,
      serialNo: Number(formData.serialNo) || (students.length + 1),
      rollNo: formData.rollNo.trim(),
      name: formData.name.trim(),
      fatherName: formData.fatherName.trim() || 'N/A',
      semester: formData.semester,
      academicYear: formData.academicYear || '2025-2026',
      prn: formData.prn.trim() || `BScN-${formData.rollNo}`,
      gender: formData.gender,
      status: formData.status
    };

    storageService.saveStudent(studentToSave);
    refreshList();
    setShowModal(false);
  };

  const handleBulkImport = () => {
    if (!bulkCsvText.trim()) return;
    const lines = bulkCsvText.split('\n');
    const newItems = [];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      // Format: Roll, Name, FatherName, Semester
      if (parts.length >= 2 && parts[0] && parts[1]) {
        newItems.push({
          id: `STU-${Date.now()}-${idx}`,
          serialNo: students.length + idx + 1,
          rollNo: parts[0],
          name: parts[1],
          fatherName: parts[2] || 'N/A',
          semester: parts[3] || 'Semester II',
          academicYear: '2025-2026',
          prn: `BScN-${parts[0]}`,
          gender: 'Female',
          status: 'Present'
        });
      }
    });

    if (newItems.length > 0) {
      const updated = [...students, ...newItems];
      storageService.saveStudents(updated);
      setStudents(updated);
      setBulkCsvText('');
      setShowBulkModal(false);
    }
  };

  // Filter students based on semester & search
  const filteredStudents = students.filter(s => {
    let matchSem = true;
    if (selectedSemester === 'Odd Semesters (1, 3, 5, 7)') {
      matchSem = ['Semester I', 'Semester III', 'Semester V', 'Semester VII'].includes(s.semester);
    } else if (selectedSemester === 'Even Semesters (2, 4, 6, 8)') {
      matchSem = ['Semester II', 'Semester IV', 'Semester VI', 'Semester VIII'].includes(s.semester);
    } else if (selectedSemester !== 'All Semesters') {
      matchSem = s.semester === selectedSemester;
    }

    const query = search.toLowerCase();
    const matchSearch = 
      s.rollNo.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      (s.fatherName && s.fatherName.toLowerCase().includes(query)) ||
      (s.prn && s.prn.toLowerCase().includes(query));

    return matchSem && matchSearch;
  });

  const toggleAttendance = (stu) => {
    const nextStatus = stu.status === 'Absent' ? 'Present' : 'Absent';
    storageService.updateStudent(stu.id, { status: nextStatus });
    refreshList();
  };

  const totalCandidatesCount = students.length;
  const presentCandidatesCount = students.filter(s => s.status !== 'Absent').length;
  const absentCandidatesCount = students.filter(s => s.status === 'Absent').length;
  const attendanceRate = totalCandidatesCount > 0 
    ? Math.round((presentCandidatesCount / totalCandidatesCount) * 100) 
    : 100;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* KPI Summary Cards */}
      <div className="student-kpi-grid">
        <div className="glass-panel kpi-card-cyan" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Registered
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
            {totalCandidatesCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Candidates</span>
          </div>
        </div>

        <div className="glass-panel kpi-card-emerald" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Present for OSCE
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
            {presentCandidatesCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Active</span>
          </div>
        </div>

        <div className="glass-panel kpi-card-amber" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Marked Absent
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: absentCandidatesCount > 0 ? '#dc2626' : '#64748b', marginTop: '2px' }}>
            {absentCandidatesCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Students</span>
          </div>
        </div>

        <div className="glass-panel kpi-card-indigo" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Attendance Rate
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
            {attendanceRate}% <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Turnout</span>
          </div>
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div className="student-top-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Student Records Database</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Semester-wise candidate directory • {filteredStudents.length} candidates displayed
            </p>
          </div>

          <div className="student-top-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
              <UserPlus size={14} /> Add Candidate
            </button>
            <button onClick={() => setShowBulkModal(true)} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
              <FileSpreadsheet size={14} /> Bulk CSV
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="student-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
          {/* Semester Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 200px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="form-select"
              style={{ width: '100%', fontSize: '0.8rem', padding: '7px 10px' }}
            >
              {SEMESTER_OPTIONS.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="search-box" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            minWidth: '240px',
            flex: '2 1 260px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search Roll No, Candidate Name, or Father's Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW (Phones < 768px) */}
      <div className="mobile-only" style={{ marginBottom: '20px' }}>
        {filteredStudents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No candidate records found matching criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredStudents.map((stu, index) => (
              <div key={stu.id} className="glass-panel" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem'
                    }}>
                      #{stu.rollNo}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>
                        {stu.name}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        S.No: {stu.serialNo || index + 1} • {stu.prn}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAttendance(stu)}
                    className={`badge ${stu.status === 'Absent' ? 'badge-danger' : 'badge-emerald'}`}
                    style={{ fontSize: '0.65rem', border: 'none', cursor: 'pointer' }}
                    title="Tap to toggle Attendance"
                  >
                    {stu.status}
                  </button>
                </div>

                <div style={{
                  background: 'var(--bg-input)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Father: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{stu.fatherName || '—'}</strong>
                  </div>
                  <span className="badge badge-scheduled" style={{ fontSize: '0.65rem' }}>
                    {stu.semester}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => openEditModal(stu)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(stu.id)}
                    className="btn btn-danger"
                    style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Screens >= 768px) */}
      <div className="glass-panel mobile-hide" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px' }}>S.No</th>
                <th style={{ padding: '12px 16px' }}>Roll Number</th>
                <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                <th style={{ padding: '12px 16px' }}>Father's Name</th>
                <th style={{ padding: '12px 16px' }}>Semester</th>
                <th style={{ padding: '12px 16px' }}>Academic Year</th>
                <th style={{ padding: '12px 16px' }}>Attendance</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No student records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu, index) => (
                  <tr key={stu.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {stu.serialNo || (index + 1)}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                      #{stu.rollNo}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {stu.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {stu.fatherName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-scheduled">
                        {stu.semester || 'Semester II'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {stu.academicYear || '2025-2026'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => toggleAttendance(stu)}
                        className={`badge ${stu.status === 'Absent' ? 'badge-danger' : 'badge-emerald'}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        title="Click to toggle attendance status"
                      >
                        {stu.status === 'Absent' ? '● ABSENT' : '✓ PRESENT'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(stu)}
                          className="btn btn-outline btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Student"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(stu.id)}
                          className="btn btn-outline btn-icon"
                          style={{ width: '28px', height: '28px', color: '#ef4444' }}
                          title="Delete Student"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT STUDENT MODAL --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {editingStudent ? 'Edit Candidate Details' : 'Register New Candidate'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} style={{ padding: '20px' }}>
              <div className="modal-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Serial Number (S.No)
                  </label>
                  <input
                    type="number"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. 01"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Candidate Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Mehta"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Father's Name *
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="e.g. Sanjay Mehta"
                  className="form-input"
                  required
                />
              </div>

              <div className="modal-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Semester *
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
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="form-select"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Attendance Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={15} /> Save Candidate Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BULK IMPORT MODAL --- */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Bulk Import Students (CSV Format)</h3>
              <button onClick={() => setShowBulkModal(false)} className="btn btn-outline btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Paste lines in format: <code>Roll Number, Candidate Name, Father's Name, Semester</code>
              </p>

              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder="01, Aarav Mehta, Sanjay Mehta, Semester II&#10;02, Bhavna Joshi, Ramesh Joshi, Semester II&#10;03, Chirag Sen, Alok Sen, Semester II"
                className="form-textarea"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '16px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button onClick={() => setShowBulkModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button onClick={handleBulkImport} className="btn btn-primary">
                  <FileSpreadsheet size={15} /> Import Candidate Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
