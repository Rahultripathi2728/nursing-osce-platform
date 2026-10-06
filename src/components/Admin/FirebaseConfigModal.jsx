import React, { useState } from 'react';
import { X, Database, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, UploadCloud } from 'lucide-react';
import { firebaseService } from '../../services/firebase';
import { storageService } from '../../services/storageService';

export default function FirebaseConfigModal({ onClose }) {
  const existingConfig = firebaseService.getConfig() || {};
  const [apiKey, setApiKey] = useState(existingConfig.apiKey || '');
  const [projectId, setProjectId] = useState(existingConfig.projectId || '');
  const [authDomain, setAuthDomain] = useState(existingConfig.authDomain || '');
  const [storageBucket, setStorageBucket] = useState(existingConfig.storageBucket || '');
  const [appId, setAppId] = useState(existingConfig.appId || '');

  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setStatusType('error');
      setStatusMessage('API Key and Project ID are required to connect Firebase.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      appId: appId.trim()
    };

    const res = firebaseService.initFirebase(config);
    if (res.success) {
      setStatusType('success');
      setStatusMessage('Connected to Firebase! Uploading students, rubrics, and exam to Firestore...');
      storageService.initCloudListeners();
      try {
        const syncRes = await storageService.seedToCloud();
        setStatusMessage(`Connected & Synced! All ${syncRes.syncedCounts.students} students, ${syncRes.syncedCounts.procedures} checklists, and exam stored in Firestore.`);
      } catch (err) {
        setStatusMessage(`Connected to Firebase! Use the "Upload All to Cloud" button below to sync.`);
      }
    } else {
      setStatusType('error');
      setStatusMessage(`Connection failed: ${res.error}`);
    }
  };

  const handleSyncAll = async () => {
    if (!firebaseService.isConfigured()) {
      setStatusType('error');
      setStatusMessage('Please connect Firebase first before syncing.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await storageService.seedToCloud();
      setStatusType('success');
      setStatusMessage(`All data successfully stored in Firestore! (${res.syncedCounts.students} Students, ${res.syncedCounts.procedures} Checklists, ${res.syncedCounts.examiners} Examiners)`);
    } catch (err) {
      setStatusType('error');
      setStatusMessage(`Cloud sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClear = () => {
    firebaseService.clearConfig();
    setApiKey('');
    setProjectId('');
    setAuthDomain('');
    setStorageBucket('');
    setAppId('');
    setStatusType('info');
    setStatusMessage('Switched back to Local Realtime Storage Engine.');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Firebase Cloud Sync</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Connect Firebase for multi-device cloud synchronization
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConnect} style={{ padding: '18px 20px' }}>
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Hybrid Storage Engine:</strong> The application functions instantly via the local realtime engine. Connecting Firebase syncs scores across devices in real time.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Firebase Project ID *
              </label>
              <input
                type="text"
                placeholder="e.g. nursing-osce-exam"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Firebase Web API Key *
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="modal-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Auth Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="project.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  App ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="1:123456:web:abcd"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {statusMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              background: statusType === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${statusType === 'success' ? '#22c55e' : '#ef4444'}`,
              color: 'var(--text-primary)',
              fontSize: '0.8rem'
            }}>
              {statusType === 'success' ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#ef4444" />}
              <span>{statusMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleClear} className="btn btn-outline" style={{ fontSize: '0.75rem' }}>
                Clear / Local Engine
              </button>
              {firebaseService.isConfigured() && (
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                  className="btn btn-success"
                  style={{ fontSize: '0.75rem', padding: '7px 12px' }}
                >
                  <UploadCloud size={14} />
                  <span>{isSyncing ? 'Uploading...' : 'Upload All to Firestore'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
