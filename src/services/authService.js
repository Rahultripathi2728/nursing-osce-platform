// Authentication & Role-Based Access Control Service
// Provides secure Login Gate for Admin and Station Examiners

import { storageService } from './storageService';

const AUTH_STORAGE_KEY = 'NURSING_OSCE_AUTH_USER';

export const authService = {
  getCurrentUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  loginAdmin(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    // Default admin credential or custom admin credential
    if ((trimmedEmail === 'admin@nursing.edu' || trimmedEmail === 'admin') && trimmedPassword === 'admin123') {
      const adminUser = {
        role: 'admin',
        name: 'Chief Examination Controller',
        email: 'admin@nursing.edu',
        loginTime: new Date().toISOString()
      };
      this.setCurrentUser(adminUser);
      return { success: true, user: adminUser };
    }

    return { success: false, error: 'Invalid admin credentials. Use admin@nursing.edu / admin123' };
  },

  loginExaminer(pinOrId) {
    const query = (pinOrId || '').trim();
    if (!query) {
      return { success: false, error: 'Please enter your 4-digit PIN or Faculty ID' };
    }

    const examiners = storageService.getExaminers();
    const exam = storageService.getExam();
    const stations = exam.stations || [];

    // Match by PIN or Faculty ID
    const examiner = examiners.find(
      (e) => e.pin === query || e.id.toLowerCase() === query.toLowerCase()
    );

    if (!examiner) {
      return { success: false, error: 'Faculty ID or PIN not found in system roster' };
    }

    // Check which station this examiner is assigned to in active examination
    const assignedStation = stations.find((s) => s.examinerId === examiner.id);

    const examinerUser = {
      role: 'examiner',
      id: examiner.id,
      name: examiner.name,
      designation: examiner.designation,
      pin: examiner.pin,
      email: examiner.email,
      stationNumber: assignedStation ? assignedStation.stationNumber : 1,
      isAssigned: !!assignedStation,
      loginTime: new Date().toISOString()
    };

    this.setCurrentUser(examinerUser);
    return { success: true, user: examinerUser };
  },

  logout() {
    this.setCurrentUser(null);
  }
};
