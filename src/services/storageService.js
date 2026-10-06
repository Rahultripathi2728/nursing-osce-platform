// Unified Real-Time Storage & Synchronization Service
// Features: Local Storage persistence + BroadcastChannel (Cross-tab live sync) + Firebase bridge

import {
  DEFAULT_EXAM_CONFIG,
  PRELOADED_SUBJECTS,
  PRELOADED_PROCEDURES,
  PRELOADED_EXAMINERS,
  PRELOADED_STUDENTS
} from '../data/preloadedData';
import { firebaseService } from './firebase';

const STORAGE_KEYS = {
  EXAM: 'NURSING_OSCE_EXAM',
  PROCEDURES: 'NURSING_OSCE_PROCEDURES',
  EXAMINERS: 'NURSING_OSCE_EXAMINERS',
  STUDENTS: 'NURSING_OSCE_STUDENTS',
  EVALUATIONS: 'NURSING_OSCE_EVALUATIONS',
  TIMER: 'NURSING_OSCE_TIMER'
};

class StorageService {
  constructor() {
    this.broadcastChannel = null;
    this.subscribers = new Set();
    this.initBroadcast();
    this.initCloudListeners();
  }

  initCloudListeners() {
    if (firebaseService.isConfigured()) {
      const exam = this.getExam();
      firebaseService.listenToCloudUpdates(exam?.id, {
        onExamUpdate: (cloudExam) => {
          localStorage.setItem(STORAGE_KEYS.EXAM, JSON.stringify(cloudExam));
          this.emitSync('EXAM_UPDATED', cloudExam);
        },
        onStudentsUpdate: (cloudStudents) => {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cloudStudents));
          this.emitSync('STUDENTS_UPDATED', cloudStudents);
        },
        onProceduresUpdate: (cloudProcs) => {
          localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(cloudProcs));
          this.emitSync('PROCEDURES_UPDATED', cloudProcs);
        },
        onEvaluationsUpdate: (cloudEvals) => {
          localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(cloudEvals));
          this.emitSync('EVALUATION_SAVED', { evaluation: cloudEvals });
        }
      });
    }
  }

  seedToCloud() {
    return firebaseService.seedAllToFirestore({
      exam: this.getExam(),
      students: this.getStudents(),
      procedures: this.getProcedures(),
      examiners: this.getExaminers(),
      evaluations: this.getEvaluations()
    });
  }

  initBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('NURSING_OSCE_SYNC_CHANNEL');
      this.broadcastChannel.onmessage = (event) => {
        this.notifySubscribers(event.data);
      };
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(event) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Subscriber callback error', err);
      }
    });
  }

  emitSync(type, payload) {
    const event = { type, payload, timestamp: Date.now() };
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }
    this.notifySubscribers(event);
  }

  // --- Initializers & Getters ---

  getExam() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAM);
      return data ? JSON.parse(data) : DEFAULT_EXAM_CONFIG;
    } catch {
      return DEFAULT_EXAM_CONFIG;
    }
  }

  saveExam(exam) {
    localStorage.setItem(STORAGE_KEYS.EXAM, JSON.stringify(exam));
    this.emitSync('EXAM_UPDATED', exam);
    firebaseService.syncExamState(exam);
  }

  getProcedures() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
      return data ? JSON.parse(data) : PRELOADED_PROCEDURES;
    } catch {
      return PRELOADED_PROCEDURES;
    }
  }

  saveProcedures(procedures) {
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
    this.emitSync('PROCEDURES_UPDATED', procedures);
    firebaseService.syncProcedures(procedures);
  }

  saveProcedure(procedure) {
    const all = this.getProcedures();
    const index = all.findIndex((p) => p.id === procedure.id);
    let updated;
    if (index >= 0) {
      updated = [...all];
      updated[index] = procedure;
    } else {
      updated = [procedure, ...all];
    }
    this.saveProcedures(updated);
    return updated;
  }

  deleteProcedure(procId) {
    const all = this.getProcedures();
    const updated = all.filter((p) => p.id !== procId);
    this.saveProcedures(updated);
    return updated;
  }

  getExaminers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMINERS);
      return data ? JSON.parse(data) : PRELOADED_EXAMINERS;
    } catch {
      return PRELOADED_EXAMINERS;
    }
  }

  saveExaminers(examiners) {
    localStorage.setItem(STORAGE_KEYS.EXAMINERS, JSON.stringify(examiners));
    this.emitSync('EXAMINERS_UPDATED', examiners);
    firebaseService.syncExaminers(examiners);
  }

  getStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : PRELOADED_STUDENTS;
    } catch {
      return PRELOADED_STUDENTS;
    }
  }

  saveStudents(students) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.emitSync('STUDENTS_UPDATED', students);
    firebaseService.syncStudents(students);
  }

  saveStudent(student) {
    const all = this.getStudents();
    const index = all.findIndex((s) => s.id === student.id);
    let updated;
    if (index >= 0) {
      updated = [...all];
      updated[index] = student;
    } else {
      updated = [student, ...all];
    }
    this.saveStudents(updated);
    return updated;
  }

  deleteStudent(studentId) {
    const all = this.getStudents();
    const updated = all.filter((s) => s.id !== studentId);
    this.saveStudents(updated);
    return updated;
  }

  getEvaluations() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  saveEvaluation(stationNumber, studentId, evaluationData) {
    const all = this.getEvaluations();
    const key = `STN_${stationNumber}_STU_${studentId}`;
    all[key] = {
      ...evaluationData,
      stationNumber,
      studentId,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(all));
    this.emitSync('EVALUATION_SAVED', { key, evaluation: all[key] });

    const exam = this.getExam();
    firebaseService.syncEvaluationScore(exam.id, all[key]);
    return all[key];
  }

  // --- Dynamic Station-Examiner Reassignment (Collision-Free) ---
  reassignExaminer(stationNumber, newExaminerId) {
    const exam = this.getExam();
    const stations = [...(exam.stations || [])];

    // Check collision: Is this examiner already assigned to another station?
    const existingStation = stations.find(
      (s) => s.examinerId === newExaminerId && s.stationNumber !== stationNumber
    );

    if (existingStation) {
      // Find the current examiner of the target station and swap them
      const currentTargetExaminer = stations.find((s) => s.stationNumber === stationNumber)?.examinerId;
      existingStation.examinerId = currentTargetExaminer;
    }

    const targetStation = stations.find((s) => s.stationNumber === stationNumber);
    if (targetStation) {
      targetStation.examinerId = newExaminerId;
    }

    const updatedExam = { ...exam, stations };
    this.saveExam(updatedExam);
    return updatedExam;
  }

  // --- Dynamic Circular Rotation Engine ---

  /**
   * Calculates which student is assigned to a specific station in a specific round.
   * Matches exam semester with candidate roster, filters out absentees, and applies circular ring permutation.
   */
  getAssignedStudent(stationNumber, roundNumber) {
    const exam = this.getExam();
    const allStudents = this.getStudents();
    const stationCount = exam.stationCount || 6;

    // Filter students by exam semester if specified, otherwise use all available
    let semesterStudents = allStudents.filter(
      (s) => !exam.semester || s.semester === exam.semester
    );
    if (semesterStudents.length === 0) {
      semesterStudents = allStudents;
    }

    // Filter out absentees for active rotation
    const activeStudents = semesterStudents.filter((s) => s.status !== 'Absent');

    if (activeStudents.length === 0) return null;

    // Standard Circular Ring Permutation
    // For Station s in Round k (1-indexed)
    const baseOffset = (stationNumber - roundNumber + stationCount * 10) % stationCount;
    const studentIndex = baseOffset % activeStudents.length;

    return activeStudents[studentIndex] || null;
  }

  /**
   * Generates the entire full-grid Rotation Matrix for all rounds and all stations
   */
  getRotationMatrix() {
    const exam = this.getExam();
    const stationCount = exam.stationCount || 6;
    const totalRounds = exam.totalRounds || stationCount;
    const matrix = [];

    for (let round = 1; round <= totalRounds; round++) {
      const roundRow = { round, stations: {} };
      for (let stn = 1; stn <= stationCount; stn++) {
        roundRow.stations[stn] = this.getAssignedStudent(stn, round);
      }
      matrix.push(roundRow);
    }
    return matrix;
  }

  /**
   * Handles student marked absent during an examination
   */
  markStudentAbsent(studentId, stationNumber) {
    const students = this.getStudents();
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, status: 'Absent', absentAtStation: stationNumber };
      }
      return s;
    });

    this.saveStudents(updatedStudents);

    // Save a zero / Absent evaluation score for this student at this station
    const all = this.getEvaluations();
    const key = `STN_${stationNumber}_STU_${studentId}`;
    all[key] = {
      stationNumber,
      studentId,
      totalScore: 0,
      maxScore: 20,
      isAbsent: true,
      remarks: 'Candidate marked Absent during OSCE Station verification',
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(all));

    this.emitSync('STUDENT_ABSENT', { studentId, stationNumber });
    return updatedStudents;
  }

  // --- Reset to Factory Defaults ---
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.EXAM);
    localStorage.removeItem(STORAGE_KEYS.PROCEDURES);
    localStorage.removeItem(STORAGE_KEYS.EXAMINERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.TIMER);
    this.emitSync('RESET_ALL', {});
  }
}

export const storageService = new StorageService();
