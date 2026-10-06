// Firebase Backend & Cloud Sync Service
// Provides real-time bidirectional synchronization with Google Cloud Firestore
// Automatically loads from .env or in-app FirebaseConfigModal

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY = 'NURSING_OSCE_FIREBASE_CONFIG';

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.isInitialized = false;
    this.unsubscribers = [];
    this.loadSavedConfig();
  }

  loadSavedConfig() {
    try {
      // 1. First priority: Check Vite environment variables (.env)
      const envConfig = {
        apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env?.VITE_FIREBASE_APP_ID
      };

      if (envConfig.apiKey && envConfig.projectId && !envConfig.apiKey.includes('your_')) {
        this.initFirebase(envConfig, false);
        return;
      }

      // 2. Second priority: Check localStorage saved configuration
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.apiKey && config.projectId) {
          this.initFirebase(config, false);
        }
      }
    } catch (e) {
      console.warn('Could not auto-initialize Firebase from storage', e);
    }
  }

  initFirebase(config, saveToStorage = true) {
    try {
      if (!config.apiKey || !config.projectId) {
        throw new Error('API Key and Project ID are required');
      }

      const apps = getApps();
      this.app = apps.length > 0 ? getApp() : initializeApp(config);
      this.db = getFirestore(this.app);
      this.isInitialized = true;

      if (saveToStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      }
      return { success: true, projectId: config.projectId };
    } catch (error) {
      console.error('Firebase Init Error:', error);
      this.isInitialized = false;
      return { success: false, error: error.message };
    }
  }

  isConfigured() {
    return this.isInitialized && this.db !== null;
  }

  getConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      if (import.meta.env?.VITE_FIREBASE_PROJECT_ID) {
        return {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  clearConfig() {
    localStorage.removeItem(STORAGE_KEY);
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch {}
    });
    this.unsubscribers = [];
    this.app = null;
    this.db = null;
    this.isInitialized = false;
  }

  // =========================================================================
  // SYNC METHODS (WRITE TO FIRESTORE)
  // =========================================================================

  // 1. Cloud Sync Exam State (Title, Semester, Stations, Current Round, Status)
  async syncExamState(examData) {
    if (!this.isConfigured() || !examData?.id) return;
    try {
      const examRef = doc(this.db, 'examinations', examData.id);
      await setDoc(examRef, {
        ...examData,
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing exam to Firestore:', err);
    }
  }

  // 2. Cloud Sync Students Roster (All candidates, Roll Nos, Father Names, Attendance)
  async syncStudents(students) {
    if (!this.isConfigured() || !Array.isArray(students)) return;
    try {
      const rosterRef = doc(this.db, 'roster', 'active_students');
      await setDoc(rosterRef, {
        students,
        count: students.length,
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing students to Firestore:', err);
    }
  }

  // 3. Cloud Sync Procedures Catalog (Checklists, Rubrics, Steps, Max Marks)
  async syncProcedures(procedures) {
    if (!this.isConfigured() || !Array.isArray(procedures)) return;
    try {
      const catalogRef = doc(this.db, 'catalog', 'procedures');
      await setDoc(catalogRef, {
        procedures,
        count: procedures.length,
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing procedures to Firestore:', err);
    }
  }

  // 4. Cloud Sync Faculty Examiners (Names, Stations, 4-Digit Access PINs)
  async syncExaminers(examiners) {
    if (!this.isConfigured() || !Array.isArray(examiners)) return;
    try {
      const examinerRef = doc(this.db, 'examiners', 'active_list');
      await setDoc(examinerRef, {
        examiners,
        count: examiners.length,
        lastSyncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing examiners to Firestore:', err);
    }
  }

  // 5. Cloud Sync Individual Station Evaluation Score
  async syncEvaluationScore(examId, evaluation) {
    if (!this.isConfigured() || !examId || !evaluation) return;
    try {
      const evalRef = doc(this.db, 'examinations', examId, 'evaluations', `${evaluation.stationNumber}_${evaluation.studentId}`);
      await setDoc(evalRef, {
        ...evaluation,
        syncedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing evaluation to Firestore:', err);
    }
  }

  // 6. One-Click Complete Upload / Seed to Cloud
  async seedAllToFirestore(data) {
    if (!this.isConfigured()) {
      throw new Error('Firebase is not connected yet.');
    }

    const { exam, students, procedures, examiners, evaluations } = data;

    // 1. Sync Exam
    if (exam) await this.syncExamState(exam);
    // 2. Sync Students
    if (students) await this.syncStudents(students);
    // 3. Sync Procedures
    if (procedures) await this.syncProcedures(procedures);
    // 4. Sync Examiners
    if (examiners) await this.syncExaminers(examiners);
    // 5. Sync Existing Evaluations
    if (evaluations && exam?.id) {
      const entries = Object.values(evaluations);
      for (const ev of entries) {
        await this.syncEvaluationScore(exam.id, ev);
      }
    }

    return {
      success: true,
      syncedCounts: {
        students: students?.length || 0,
        procedures: procedures?.length || 0,
        examiners: examiners?.length || 0,
        evaluations: Object.keys(evaluations || {}).length
      }
    };
  }

  // =========================================================================
  // REAL-TIME FIRESTORE SUBSCRIPTIONS (LISTEN TO CLOUD CHANGES)
  // =========================================================================

  listenToCloudUpdates(examId, callbacks = {}) {
    if (!this.isConfigured()) return () => {};

    // Clear any previous listeners
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch {}
    });
    this.unsubscribers = [];

    try {
      // 1. Listen to Exam Document (e.g. Current Round, Live Status, Station Rotation)
      if (examId) {
        const examRef = doc(this.db, 'examinations', examId);
        const unsubExam = onSnapshot(examRef, (snapshot) => {
          if (snapshot.exists() && callbacks.onExamUpdate) {
            callbacks.onExamUpdate(snapshot.data());
          }
        }, (err) => console.warn('Firestore exam snapshot error:', err));
        this.unsubscribers.push(unsubExam);

        // 2. Listen to Evaluations Subcollection
        const evalsCol = collection(this.db, 'examinations', examId, 'evaluations');
        const unsubEvals = onSnapshot(evalsCol, (snapshot) => {
          if (callbacks.onEvaluationsUpdate) {
            const evalsMap = {};
            snapshot.forEach(docSnap => {
              const d = docSnap.data();
              evalsMap[`STN_${d.stationNumber}_STU_${d.studentId}`] = d;
            });
            callbacks.onEvaluationsUpdate(evalsMap);
          }
        }, (err) => console.warn('Firestore evals snapshot error:', err));
        this.unsubscribers.push(unsubEvals);
      }

      // 3. Listen to Students Roster Document
      const rosterRef = doc(this.db, 'roster', 'active_students');
      const unsubRoster = onSnapshot(rosterRef, (snapshot) => {
        if (snapshot.exists() && callbacks.onStudentsUpdate) {
          const data = snapshot.data();
          if (Array.isArray(data.students)) {
            callbacks.onStudentsUpdate(data.students);
          }
        }
      }, (err) => console.warn('Firestore roster snapshot error:', err));
      this.unsubscribers.push(unsubRoster);

      // 4. Listen to Procedures Catalog Document
      const catalogRef = doc(this.db, 'catalog', 'procedures');
      const unsubCatalog = onSnapshot(catalogRef, (snapshot) => {
        if (snapshot.exists() && callbacks.onProceduresUpdate) {
          const data = snapshot.data();
          if (Array.isArray(data.procedures)) {
            callbacks.onProceduresUpdate(data.procedures);
          }
        }
      }, (err) => console.warn('Firestore catalog snapshot error:', err));
      this.unsubscribers.push(unsubCatalog);

    } catch (err) {
      console.error('Error attaching Firestore realtime listeners:', err);
    }

    return () => {
      this.unsubscribers.forEach(unsub => {
        try { unsub(); } catch {}
      });
      this.unsubscribers = [];
    };
  }
}

export const firebaseService = new FirebaseService();
