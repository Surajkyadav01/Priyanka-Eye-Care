/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X, Lock, Eye, EyeOff, Search, Filter, ShieldCheck,
  TrendingUp, Calendar, Trash2, CheckCircle, Ban, RefreshCw, LogOut,
  SlidersHorizontal, Check, AlertCircle, Inbox, BellOff
} from 'lucide-react';
import { Appointment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentsChanged: () => void;
}

export default function AdminDashboard({ isOpen, onClose, onAppointmentsChanged }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard content states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Change Password States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Forgot / Reset Password States
  const [showResetView, setShowResetView] = useState(false);
  const [resetKeyInput, setResetKeyInput] = useState('');
  const [resetNewPasswordInput, setResetNewPasswordInput] = useState('');
  const [resetConfirmPasswordInput, setResetConfirmPasswordInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterService, setFilterService] = useState('all');

  // Check sessionStorage on open
  useEffect(() => {
    if (isOpen) {
      const token = sessionStorage.getItem('admin_token');
      const pass = sessionStorage.getItem('admin_pass');
      if (token && pass) {
        setIsAuthenticated(true);
      }
    }
  }, [isOpen]);

  // Establish real-time listener on appointments when dashboard is open and authenticated
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    
    if (isOpen && isAuthenticated) {
      const pass = sessionStorage.getItem('admin_pass') || 'doctor';
      setLoading(true);
      setError(null);
      
      try {
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
          const docsList: Appointment[] = [];
          querySnapshot.forEach((docSnapshot) => {
            docsList.push({ id: docSnapshot.id, ...docSnapshot.data() } as Appointment);
          });
          
          setAppointments(docsList);
          setLoading(false);
          console.log('Real-time admin appointments list updated:', docsList.length);
          
          // Auto-mark notifications as read
          try {
            markAllNotificationsAsRead(pass, docsList);
          } catch (e) {
            console.warn('Could not auto-mark read:', e);
          }
        }, (fbErr) => {
          console.warn('Admin real-time listener failed, falling back to static fetch:', fbErr);
          try {
            handleFirestoreError(fbErr, OperationType.GET, 'appointments');
          } catch (e) {
            // Fetch once as fallback
            fetchAppointments(pass);
          }
        });
      } catch (err) {
        console.warn('Failed to set up Admin real-time listener:', err);
        fetchAppointments(pass);
      }
    }
    
    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [isOpen, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    if (!password) {
      setLoginError('Password is required');
      setLoginLoading(false);
      return;
    }

    let isServerLoginSuccess = false;
    let serverData: any = null;
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        serverData = await response.json();
        if (serverData && serverData.success) {
          isServerLoginSuccess = true;
        }
      }
    } catch (err) {
      console.warn('Backend server login offline, attempting local login:', err);
    }

    if (isServerLoginSuccess && serverData) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_token', serverData.token);
      sessionStorage.setItem('admin_pass', password);
      fetchAppointments(password);
    } else {
      // Local login fallback (e.g. on static GitHub Pages deployment where backend is absent)
      const storedLocalPass = localStorage.getItem('pec_admin_password');
      const isCorrectLocal = storedLocalPass 
        ? password === storedLocalPass 
        : (password === 'doctor' || password === 'PriyankaEyeCare@Admin');

      if (isCorrectLocal) {
        if (!storedLocalPass) {
          localStorage.setItem('pec_admin_password', password);
        }
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_token', 'local_token_secured');
        sessionStorage.setItem('admin_pass', password);
        fetchAppointments(password);
      } else {
        setLoginError('Invalid password. Please retry.');
      }
    }
    setLoginLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (resetKeyInput !== 'ksurajyadav93@gmail.com') {
      setResetError('Invalid verification registered email.');
      return;
    }

    if (resetNewPasswordInput !== resetConfirmPasswordInput) {
      setResetError('Passwords do not match.');
      return;
    }

    if (resetNewPasswordInput.length < 4) {
      setResetError('Password must be at least 4 characters.');
      return;
    }

    setResetLoading(true);
    let serverSuccess = false;

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetKey: resetKeyInput, newPassword: resetNewPasswordInput })
      });
      if (response.ok) {
        serverSuccess = true;
      }
    } catch (err) {
      console.warn('Backend offline, resetting password locally:', err);
    }

    // Always update client-side fallback localStorage too, so offline mode (GitHub Pages) is fully working
    localStorage.setItem('pec_admin_password', resetNewPasswordInput);
    
    setResetSuccess('Password successfully reset! You can now log in.');
    setResetLoading(false);
    
    // Automatically fill the login password with the newly reset password
    setPassword(resetNewPasswordInput);
    
    // Switch view back after 2 seconds
    setTimeout(() => {
      setShowResetView(false);
      setResetSuccess(null);
      setResetKeyInput('');
      setResetNewPasswordInput('');
      setResetConfirmPasswordInput('');
    }, 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    const storedLocalPass = localStorage.getItem('pec_admin_password') || 'doctor';
    const currentPass = sessionStorage.getItem('admin_pass') || 'doctor';

    if (currentPasswordInput !== currentPass && currentPasswordInput !== storedLocalPass && currentPasswordInput !== 'PriyankaEyeCare@Admin' && currentPasswordInput !== 'doctor') {
      setChangePasswordError('Incorrect current password.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError('New passwords do not match.');
      return;
    }

    if (newPasswordInput.length < 4) {
      setChangePasswordError('New password must be at least 4 characters.');
      return;
    }

    setChangePasswordLoading(true);
    let serverSuccess = false;

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPasswordInput, newPassword: newPasswordInput })
      });
      if (response.ok) {
        serverSuccess = true;
      }
    } catch (err) {
      console.warn('Backend server offline, changing password locally:', err);
    }

    // Always update client-side fallback localStorage too, so offline mode (GitHub Pages) is fully in sync
    localStorage.setItem('pec_admin_password', newPasswordInput);
    sessionStorage.setItem('admin_pass', newPasswordInput);

    setChangePasswordSuccess('Password successfully changed!');
    setChangePasswordLoading(false);

    // Clear inputs and close modal after a brief delay
    setTimeout(() => {
      setShowChangePasswordModal(false);
      setChangePasswordSuccess(null);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }, 1800);
  };

  const fetchAppointments = async (passKey: string) => {
    setLoading(true);
    setError(null);
    let isDbSuccess = false;

    try {
      // 1. Attempt client-side read directly from Firebase Firestore
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const docsList: Appointment[] = [];
      querySnapshot.forEach((docSnapshot) => {
        docsList.push({ id: docSnapshot.id, ...docSnapshot.data() } as Appointment);
      });
      
      setAppointments(docsList);
      isDbSuccess = true;
      console.log('Successfully fetched appointments directly from Firebase Firestore!');
      
      // Auto-mark notifications as read
      try {
        await markAllNotificationsAsRead(passKey, docsList);
      } catch (e) {
        console.warn('Could not auto-mark read:', e);
      }
    } catch (fbErr) {
      console.warn('Direct Firebase fetch failed, trying backend server fallback:', fbErr);
      
      // 2. Fallback: Try fetching from backend server
      try {
        const response = await fetch(`/api/appointments?password=${encodeURIComponent(passKey)}`, {
          headers: { 'x-admin-password': passKey }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.appointments) {
            setAppointments(data.appointments);
            isDbSuccess = true;
            await markAllNotificationsAsRead(passKey, data.appointments);
          }
        }
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local storage:', err);
      }
    }

    if (!isDbSuccess) {
      // 3. Fallback: Local storage fallback for completely static offline mode
      try {
        const localAptsStr = localStorage.getItem('pec_local_appointments') || '[]';
        const localApts: Appointment[] = JSON.parse(localAptsStr);
        
        // Seed with realistic starting values if totally empty so the dashboard has life
        if (localApts.length === 0) {
          const initialMockApts: Appointment[] = [
            {
              id: 'mock_1',
              name: 'Ramesh Kumar',
              phone: '+91 98765 43210',
              email: 'ramesh.k@gmail.com',
              service: 'Cataract (मोतियाबिंद) Surgery',
              doctor: 'Dr. Abhishek Maurya (Ophthalmologist)',
              date: '2026-07-05',
              time: '10:00 AM',
              message: 'Experiencing blurry vision in my left eye for the past month.',
              status: 'pending',
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              isRead: false
            },
            {
              id: 'mock_2',
              name: 'Kiran Devi',
              phone: '+91 94150 99999',
              email: '',
              service: 'Ayurvedic Eye Therapy (Netra Tarpana)',
              doctor: 'Dr. Priyanka Maurya (Ayurvedic Specialist)',
              date: '2026-07-06',
              time: '02:00 PM',
              message: 'Chronic dry eye and irritation.',
              status: 'accepted',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              isRead: true
            }
          ];
          localStorage.setItem('pec_local_appointments', JSON.stringify(initialMockApts));
          setAppointments(initialMockApts);
        } else {
          setAppointments(localApts);
        }

        // Locally mark everything as read
        const localAptsUpdated = (localApts.length === 0 ? [] : localApts).map(apt => ({ ...apt, isRead: true }));
        if (localAptsUpdated.length > 0) {
          localStorage.setItem('pec_local_appointments', JSON.stringify(localAptsUpdated));
        }
        onAppointmentsChanged();
      } catch (e) {
        console.error('Offline appointments fetch failed:', e);
        setError('Failed to fetch clinical records from local storage.');
      }
    }
    setLoading(false);
  };

  const markAllNotificationsAsRead = async (passKey: string, currentAppointments?: Appointment[]) => {
    const listToProcess = currentAppointments || appointments;
    try {
      // Direct Firebase update for unread appointments
      const unreadApts = listToProcess.filter(apt => !apt.isRead);
      if (unreadApts.length > 0) {
        const updatePromises = unreadApts.map(apt => 
          updateDoc(doc(db, 'appointments', apt.id), { isRead: true })
        );
        await Promise.all(updatePromises);
        console.log('Successfully marked all notifications as read in Firebase directly!');
      }
    } catch (fbErr) {
      console.warn('Direct Firebase mark-read failed, trying backend server mark-read:', fbErr);
      try {
        await fetch('/api/appointments/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passKey })
        });
      } catch (err) {
        console.warn('Failed to clear unread flag via backend:', err);
      }
    }
    onAppointmentsChanged(); // Trigger navbar layout update
  };

  const updateStatus = async (appointmentId: string, nextStatus: 'accepted' | 'rejected') => {
    const pass = sessionStorage.getItem('admin_pass');
    if (!pass) return;

    setActionLoading(appointmentId);
    let isDbSuccess = false;

    try {
      // 1. Attempt status update directly in Firebase Firestore
      await updateDoc(doc(db, 'appointments', appointmentId), { status: nextStatus, isRead: true });
      isDbSuccess = true;
      console.log('Successfully updated appointment status in Firebase directly!');
    } catch (fbErr) {
      console.warn('Direct Firebase status update failed, attempting backend server save:', fbErr);
      
      // 2. Fallback: Attempt backend server save (if server is running)
      try {
        const response = await fetch(`/api/appointments/${appointmentId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass, status: nextStatus })
        });

        if (response.ok) {
          isDbSuccess = true;
        }
      } catch (err) {
        console.warn('Backend server status update failed:', err);
      }
    }

    if (isDbSuccess) {
      // Update local state smoothly
      setAppointments(prev =>
        prev.map(apt => (apt.id === appointmentId ? { ...apt, status: nextStatus, isRead: true } : apt))
      );
      onAppointmentsChanged();
    } else {
      // 3. Last fallback: Fallback update in local storage
      try {
        const localAptsStr = localStorage.getItem('pec_local_appointments') || '[]';
        let localApts: Appointment[] = JSON.parse(localAptsStr);
        localApts = localApts.map(apt => (apt.id === appointmentId ? { ...apt, status: nextStatus, isRead: true } : apt));
        localStorage.setItem('pec_local_appointments', JSON.stringify(localApts));

        setAppointments(prev =>
          prev.map(apt => (apt.id === appointmentId ? { ...apt, status: nextStatus, isRead: true } : apt))
        );
        onAppointmentsChanged();
      } catch (e) {
        console.error('Error updating appointment status locally:', e);
      }
    }
    setActionLoading(null);
  };

  const deleteAppointment = async (appointmentId: string) => {
    const pass = sessionStorage.getItem('admin_pass');
    if (!pass) return;

    setActionLoading(appointmentId);
    let isDbDeleted = false;
    
    // 1. Attempt client-side delete directly from Firebase Firestore
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      isDbDeleted = true;
      console.log('Successfully deleted appointment from Firebase directly!');
    } catch (fbErr) {
      console.warn('Direct Firebase deletion failed, attempting backend server delete:', fbErr);
      
      // 2. Fallback: Attempt backend server delete
      try {
        const response = await fetch(`/api/appointments/${appointmentId}?password=${encodeURIComponent(pass)}`, {
          method: 'DELETE',
          headers: { 'x-admin-password': pass }
        });
        if (response.ok) {
          isDbDeleted = true;
        }
      } catch (err) {
        console.warn('Backend server delete failed:', err);
      }
    }

    // 3. Always purge from local storage to keep client in sync
    try {
      const localAptsStr = localStorage.getItem('pec_local_appointments') || '[]';
      let localApts: Appointment[] = JSON.parse(localAptsStr);
      localApts = localApts.filter(apt => apt.id !== appointmentId);
      localStorage.setItem('pec_local_appointments', JSON.stringify(localApts));
    } catch (e) {
      console.error('Error deleting appointment locally:', e);
    }

    // Immediately update local state list and trigger badge counters updates
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    onAppointmentsChanged();

    setActionLoading(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_pass');
    setIsAuthenticated(false);
    setPassword('');
    setAppointments([]);
  };

  // Perform full visual search and filtering
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      (apt.email && apt.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.message && apt.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesDoctor = filterDoctor === 'all' || apt.doctor === filterDoctor;
    const matchesService = filterService === 'all' || apt.service === filterService;

    return matchesSearch && matchesStatus && matchesDoctor && matchesService;
  });

  // Calculate statistics metrics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    accepted: appointments.filter(a => a.status === 'accepted').length,
    rejected: appointments.filter(a => a.status === 'rejected').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm select-none">
      
      {/* Container Card */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header Block */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="h-8.5 w-8.5 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-900">PEC Clinic Dashboard</h2>
              <p className="text-[10px] text-slate-500 font-medium">Suriyawan, Bhadohi Admin Node</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 text-xs font-bold text-slate-600 transition"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Change Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 text-xs font-bold text-slate-600 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!isAuthenticated ? (
            showResetView ? (
              /* ========================================================
                 PASSWORD RESET WINDOW
                 ======================================================== */
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-sm space-y-5 text-center py-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-extrabold text-slate-900">Reset Password</h3>
                    <p className="text-xs text-slate-700 font-semibold">
                      Verify your registered email or previous security code to set a new admin password.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label htmlFor="reset-key-input" className="text-xs font-bold text-slate-700 block">Registered Email / Master Code</label>
                      <input
                        type="text"
                        id="reset-key-input"
                        required
                        placeholder="e.g. ksurajyadav93@gmail.com"
                        value={resetKeyInput}
                        onChange={(e) => setResetKeyInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition"
                      />
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                        Enter your registered email <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-950 font-bold font-mono">ksurajyadav93@gmail.com</code> to verify ownership.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reset-new-pass" className="text-xs font-bold text-slate-700 block">New Password</label>
                      <input
                        type="password"
                        id="reset-new-pass"
                        required
                        placeholder="At least 4 characters..."
                        value={resetNewPasswordInput}
                        onChange={(e) => setResetNewPasswordInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reset-confirm-pass" className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
                      <input
                        type="password"
                        id="reset-confirm-pass"
                        required
                        placeholder="Confirm new password..."
                        value={resetConfirmPasswordInput}
                        onChange={(e) => setResetConfirmPasswordInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition"
                      />
                    </div>

                    {resetError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{resetError}</span>
                      </div>
                    )}

                    {resetSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>{resetSuccess}</span>
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetView(false);
                          setResetError(null);
                          setResetSuccess(null);
                          setResetKeyInput('');
                          setResetNewPasswordInput('');
                          setResetConfirmPasswordInput('');
                        }}
                        className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-800 transition"
                      >
                        Back to Login
                      </button>
                      
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
                      >
                        {resetLoading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* ========================================================
                 PASSWORD PORTAL WINDOW
                 ======================================================== */
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
                <div className="w-full max-w-sm space-y-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    <Lock className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-extrabold text-slate-900">Administrator Credentials</h3>
                    <p className="text-xs text-slate-700 font-semibold">
                      Access to Priyanka Eye Care appointments is password restricted for doctor confidentiality.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="admin-password-input" className="text-xs font-bold text-slate-700">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetView(true);
                            setLoginError(null);
                          }}
                          className="text-xs font-extrabold text-blue-600 hover:underline hover:text-blue-800 focus:outline-none"
                        >
                          Forgot/Reset Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="admin-password-input"
                          required
                          placeholder="Enter admin key..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 pl-4 pr-11 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loginLoading ? 'Verifying...' : 'Authorize Session'}
                    </button>
                  </form>
                </div>
              </div>
            )
          ) : (
            /* ========================================================
               ACTIVE CLINIC DASHBOARD PANEL
               ======================================================== */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* Top stats metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Booking</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</h4>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{stats.pending}</h4>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin-slow" />
                  </div>
                </div>

                {/* Approved */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{stats.accepted}</h4>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>

                {/* Rejected */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Rejected</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{stats.rejected}</h4>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Ban className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Filters Panel bar */}
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Search and refresh */}
                  <div className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search name, phone, symptom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pl-10 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    
                    <button
                      onClick={() => {
                        const pass = sessionStorage.getItem('admin_pass');
                        if (pass) fetchAppointments(pass);
                      }}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
                      title="Sync data"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Quick toggle metrics count */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs text-slate-400 font-semibold">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Selected: {filteredAppointments.length} matching</span>
                  </div>

                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100/60">
                  {/* Filter Status */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e: any) => setFilterStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Filter Doctor */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Doctor</label>
                    <select
                      value={filterDoctor}
                      onChange={(e) => setFilterDoctor(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="all">All Doctors</option>
                      <option value="Dr. Abhishek Maurya">Dr. Abhishek</option>
                      <option value="Dr. Priyanka Maurya">Dr. Priyanka</option>
                    </select>
                  </div>

                  {/* Filter Service */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service</label>
                    <select
                      value={filterService}
                      onChange={(e) => setFilterService(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="all">All Services</option>
                      <option value="Comprehensive Eye Checkup">Eye Checkup</option>
                      <option value="Computer Vision Test">Computer Vision</option>
                      <option value="Retina Examination">Retina Examination</option>
                      <option value="Contact Lens Prescription">Contact Lens</option>
                      <option value="Premium Spectacles prescribing">Spectacles</option>
                      <option value="Children Eye Care">Children Care</option>
                      <option value="Cataract Consultation">Cataract</option>
                      <option value="Glaucoma Diagnostics">Glaucoma</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Data Table / Cards List */}
              <div className="space-y-4">
                {loading ? (
                  /* Skeleton load */
                  <div className="space-y-3">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-100" />
                    ))}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 space-y-2">
                    <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-sm">No appointment records found</p>
                    <p className="text-xs text-slate-400">Records matching search filters are empty.</p>
                  </div>
                ) : (
                  filteredAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow relative overflow-hidden ${
                        apt.status === 'accepted'
                          ? 'border-l-4 border-l-emerald-500 border-slate-100'
                          : apt.status === 'rejected'
                          ? 'border-l-4 border-l-rose-500 border-slate-100'
                          : 'border-l-4 border-l-amber-500 border-slate-100'
                      }`}
                    >
                      
                      {/* Flex wrapper */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        {/* Demographics */}
                        <div className="space-y-2.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-display font-extrabold text-base text-slate-800">{apt.name}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              apt.status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : apt.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                            }`}>
                              {apt.status}
                            </span>
                            {!apt.isRead && (
                              <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-sm">NEW</span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4 text-xs text-slate-600 leading-relaxed font-mono">
                            <div><strong>Phone:</strong> <a href={`tel:${apt.phone}`} className="text-blue-600 hover:underline">{apt.phone}</a></div>
                            <div><strong>Email:</strong> {apt.email || 'N/A'}</div>
                            <div><strong>Service:</strong> <span className="text-blue-700 font-bold">{apt.service}</span></div>
                            <div><strong>Doctor:</strong> {apt.doctor}</div>
                            <div><strong>Slot:</strong> <span className="font-bold text-slate-700">{apt.date} at {apt.time}</span></div>
                            <div className="text-[10px] text-slate-400"><strong>Booked:</strong> {new Date(apt.createdAt).toLocaleString()}</div>
                          </div>

                          {apt.message && (
                            <div className="text-xs bg-slate-50 border border-slate-100/70 p-3 rounded-lg text-slate-600 italic">
                              "{apt.message}"
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 self-end md:self-center">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(apt.id, 'accepted')}
                                disabled={actionLoading === apt.id}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white px-3 py-2 transition"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              
                              <button
                                onClick={() => updateStatus(apt.id, 'rejected')}
                                disabled={actionLoading === apt.id}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-600 px-3 py-2 transition border border-slate-200 hover:border-rose-200"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setAppointmentToDelete(apt)}
                            disabled={actionLoading === apt.id}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white px-3 py-2 transition border border-rose-600 shadow-xs active:scale-95"
                            title="Delete permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowChangePasswordModal(false);
                setChangePasswordError(null);
                setChangePasswordSuccess(null);
                setCurrentPasswordInput('');
                setNewPasswordInput('');
                setConfirmPasswordInput('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">Change Admin Password</h3>
              <p className="text-xs text-slate-500">Update the access credentials for this device and server.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label htmlFor="current-pass-input" className="text-xs font-semibold text-slate-600 block">Current Password</label>
                <input
                  type="password"
                  id="current-pass-input"
                  required
                  placeholder="Enter current password..."
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-pass-input" className="text-xs font-semibold text-slate-600 block">New Password</label>
                <input
                  type="password"
                  id="new-pass-input"
                  required
                  placeholder="At least 4 characters..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="confirm-pass-input" className="text-xs font-semibold text-slate-600 block">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-pass-input"
                  required
                  placeholder="Confirm new password..."
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              {changePasswordError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-xl flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setChangePasswordError(null);
                    setChangePasswordSuccess(null);
                    setCurrentPasswordInput('');
                    setNewPasswordInput('');
                    setConfirmPasswordInput('');
                  }}
                  className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2 text-xs font-bold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordLoading}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {changePasswordLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Deletion Confirmation Modal */}
      {appointmentToDelete && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setAppointmentToDelete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">Confirm Permanent Deletion</h3>
              <p className="text-xs text-slate-500">This action is permanent and cannot be undone.</p>
            </div>

            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-2 text-left">
              <p className="text-xs text-slate-600">
                Are you sure you want to delete the appointment of:
              </p>
              <p className="text-sm font-extrabold text-slate-900 font-sans">
                {appointmentToDelete.name}
              </p>
              <div className="text-[11px] text-slate-500 font-mono space-y-0.5 pt-1.5 border-t border-slate-200">
                <div><strong>Phone:</strong> {appointmentToDelete.phone}</div>
                <div><strong>Service:</strong> {appointmentToDelete.service}</div>
                <div><strong>Slot:</strong> {appointmentToDelete.date} at {appointmentToDelete.time}</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed text-center">
              The record will be permanently deleted from both the database (Firebase) and the website's admin panel.
            </p>

            <div className="flex gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={() => setAppointmentToDelete(null)}
                className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = appointmentToDelete.id;
                  setAppointmentToDelete(null);
                  await deleteAppointment(id);
                }}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white transition active:scale-95 shadow-xs border border-rose-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
