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
        fetchAppointments(pass);
      }
    }
  }, [isOpen]);

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
      if (password === 'PriyankaEyeCare@Admin') {
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

  const fetchAppointments = async (passKey: string) => {
    setLoading(true);
    setError(null);
    let isServerSuccess = false;
    try {
      const response = await fetch(`/api/appointments?password=${encodeURIComponent(passKey)}`, {
        headers: { 'x-admin-password': passKey }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.appointments) {
          setAppointments(data.appointments);
          isServerSuccess = true;
          await markAllNotificationsAsRead(passKey);
        }
      }
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local storage:', err);
    }

    if (!isServerSuccess) {
      // Local storage fallback for static deployments (e.g. GitHub Pages)
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

  const markAllNotificationsAsRead = async (passKey: string) => {
    try {
      await fetch('/api/appointments/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passKey })
      });
      onAppointmentsChanged(); // Trigger navbar layout update
    } catch (err) {
      console.warn('Failed to clear unread flag:', err);
    }
  };

  const updateStatus = async (appointmentId: string, nextStatus: 'accepted' | 'rejected') => {
    const pass = sessionStorage.getItem('admin_pass');
    if (!pass) return;

    setActionLoading(appointmentId);
    let isServerSuccess = false;
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass, status: nextStatus })
      });

      if (response.ok) {
        isServerSuccess = true;
      }
    } catch (err) {
      console.warn('Backend server not reachable for updating status, updating locally:', err);
    }

    if (isServerSuccess) {
      // Update local state smoothly
      setAppointments(prev =>
        prev.map(apt => (apt.id === appointmentId ? { ...apt, status: nextStatus, isRead: true } : apt))
      );
      onAppointmentsChanged();
    } else {
      // Fallback update in local storage (e.g. GitHub Pages static mode)
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
    
    // 1. Attempt to delete from backend server
    try {
      await fetch(`/api/appointments/${appointmentId}?password=${encodeURIComponent(pass)}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pass }
      });
    } catch (err) {
      console.warn('Backend server not reachable for deletion, proceeding with local purge:', err);
    }

    // 2. Always purge from local storage to keep client and database perfectly in sync
    try {
      const localAptsStr = localStorage.getItem('pec_local_appointments') || '[]';
      let localApts: Appointment[] = JSON.parse(localAptsStr);
      localApts = localApts.filter(apt => apt.id !== appointmentId);
      localStorage.setItem('pec_local_appointments', JSON.stringify(localApts));
    } catch (e) {
      console.error('Error deleting appointment locally:', e);
    }

    // 3. Immediately update local state list and trigger badge counters updates
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 text-xs font-bold text-slate-600 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
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
            /* ========================================================
               PASSWORD PORTAL WINDOW
               ======================================================== */
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
              <div className="w-full max-w-sm space-y-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  <Lock className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-xl font-extrabold text-slate-900">Administrator Credentials</h3>
                  <p className="text-xs text-slate-500">
                    Access to Priyanka Eye Care appointments is password restricted for doctor confidentiality.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label htmlFor="admin-password-input" className="text-xs font-semibold text-slate-600">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="admin-password-input"
                        required
                        placeholder="Enter admin key..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-2">
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

                <p className="text-[10px] text-slate-400">
                  Note: Default configured credentials: <code>PriyankaEyeCare@Admin</code>
                </p>
              </div>
            </div>
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
                            onClick={() => deleteAppointment(apt.id)}
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
    </div>
  );
}
