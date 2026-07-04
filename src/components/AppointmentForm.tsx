/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CalendarRange, UserCheck, Stethoscope, Clock, ShieldCheck, Mail, Phone, User, MessageSquare, ChevronLeft, ChevronRight, Printer, CheckCircle } from 'lucide-react';
import { SERVICES, DOCTORS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AppointmentFormProps {
  selectedDoctor: string;
  selectedService: string;
  onAppointmentBooked: () => void;
}

export default function AppointmentForm({ selectedDoctor, selectedService, onAppointmentBooked }: AppointmentFormProps) {
  // Local state for scheduling fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    doctor: '',
    date: '',
    time: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<{
    ticketId: string;
    name: string;
    phone: string;
    email: string;
    service: string;
    doctor: string;
    date: string;
    time: string;
    message: string;
    registeredAt: string;
  } | null>(null);

  // Custom Calendar state & functions
  const [showCalendar, setShowCalendar] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isPrevMonthDisabled = () => {
    const today = new Date();
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return prevMonth.getFullYear() < today.getFullYear() || (prevMonth.getFullYear() === today.getFullYear() && prevMonth.getMonth() < today.getMonth());
  };

  const isPastDate = (day: number) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const yyyy = selected.getFullYear();
    const mm = String(selected.getMonth() + 1).padStart(2, '0');
    const dd = String(selected.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    setFormData(prev => ({ ...prev, date: formattedDate }));
    setShowCalendar(false);
  };

  const firstDayIndex = currentMonth.getDay();
  const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  // Sync inputs when preselected values change (e.g. from service or doctor cards)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      doctor: selectedDoctor || prev.doctor,
      service: selectedService || prev.service
    }));
  }, [selectedDoctor, selectedService]);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSelect = (slot: string) => {
    setFormData(prev => ({ ...prev, time: slot }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.name || !formData.phone || !formData.service || !formData.doctor || !formData.date || !formData.time) {
      setError('Please fill out all required fields marked with an asterisk (*).');
      setLoading(false);
      return;
    }

    try {
      const appointmentId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const ticketId = `PEC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const registeredAt = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const createdAt = new Date().toISOString();

      const appointmentData = {
        id: appointmentId,
        ticketId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        message: formData.message,
        status: 'pending' as const,
        createdAt,
        isRead: false
      };

      const details = {
        ticketId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        message: formData.message,
        registeredAt
      };

      let isDbSuccess = false;

      // 1. Attempt client-side write directly to Firebase Firestore
      try {
        await setDoc(doc(db, 'appointments', appointmentId), appointmentData);
        isDbSuccess = true;
        console.log('Successfully saved appointment directly to Firebase Firestore!');
      } catch (fbErr) {
        console.warn('Direct Firebase save failed:', fbErr);
      }
      
      // 2. Also save to backend server to trigger email alerts and file backups (even if client-side write succeeded)
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...formData, id: appointmentId, ticketId, createdAt })
        });

        if (response.ok) {
          const result = await response.json();
          if (result && result.success) {
            isDbSuccess = true;
            console.log('Successfully recorded appointment on backend server!');
          }
        }
      } catch (fetchErr) {
        console.warn('Backend server save failed or unreachable:', fetchErr);
      }

      if (isDbSuccess) {
        setBookedDetails(details);
        setSuccess(true);
        onAppointmentBooked(); // Notify parent so navbar unread count is updated
        
        // Reset form data
        setFormData({
          name: '',
          phone: '',
          email: '',
          service: '',
          doctor: '',
          date: '',
          time: '',
          message: ''
        });
      } else {
        // 3. Last fallback: Fallback to localStorage (used when completely offline)
        const localAptsStr = localStorage.getItem('pec_local_appointments') || '[]';
        const localApts = JSON.parse(localAptsStr);
        localApts.push(appointmentData);
        localStorage.setItem('pec_local_appointments', JSON.stringify(localApts));

        // Notify other components (like Navbar/App) that a new local appointment has been logged
        window.dispatchEvent(new Event('local_appointments_changed'));

        setBookedDetails(details);
        setSuccess(true);
        onAppointmentBooked();

        // Reset form data
        setFormData({
          name: '',
          phone: '',
          email: '',
          service: '',
          doctor: '',
          date: '',
          time: '',
          message: ''
        });
      }
    } catch (err) {
      console.error('Error in appointment registration flow:', err);
      setError('Registration failed. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!bookedDetails) return;

    // Open a clean window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PEC Appointment Voucher - ${bookedDetails.ticketId}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                padding: 40px;
                color: #0f172a;
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 18px;
              }
              .title {
                font-size: 24px;
                font-weight: 800;
                color: #1e3a8a;
                margin: 0;
              }
              .subtitle {
                font-size: 13px;
                color: #64748b;
                margin: 4px 0 0 0;
              }
              .ticket-box {
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 24px;
                background-color: #fafafa;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
              }
              .ticket-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 12px;
                margin-bottom: 20px;
              }
              .ticket-title {
                font-size: 11px;
                font-weight: 800;
                color: #1d4ed8;
                letter-spacing: 0.1em;
              }
              .ticket-id {
                font-size: 11px;
                font-weight: 800;
                background-color: #eff6ff;
                color: #1d4ed8;
                border: 1px solid #bfdbfe;
                padding: 4px 10px;
                border-radius: 6px;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
              }
              .field {
                margin-bottom: 8px;
              }
              .field-label {
                font-size: 9px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: 700;
                margin-bottom: 3px;
                letter-spacing: 0.05em;
              }
              .field-value {
                font-size: 13px;
                font-weight: 700;
                color: #0f172a;
              }
              .reason-box {
                margin-top: 16px;
                border-top: 1px solid #e2e8f0;
                padding-top: 12px;
              }
              .reason-val {
                font-size: 12px;
                font-style: italic;
                color: #475569;
              }
              .footer {
                text-align: center;
                font-size: 11px;
                color: #94a3b8;
                margin-top: 35px;
                line-height: 1.5;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Priyanka Eye Care Hospital</h1>
              <p class="subtitle">Bypass Chauraha, Durgaganj Road, Suriyawan, Bhadohi, Uttar Pradesh</p>
            </div>
            <div class="ticket-box">
              <div class="ticket-header">
                <span class="ticket-title">VISIT VOUCHER SUMMARY</span>
                <span class="ticket-id">TICKET: ${bookedDetails.ticketId}</span>
              </div>
              <div class="grid">
                <div class="field">
                  <div class="field-label">Patient Name</div>
                  <div class="field-value">${bookedDetails.name}</div>
                </div>
                <div class="field">
                  <div class="field-label">Specialist Doctor</div>
                  <div class="field-value">${bookedDetails.doctor}</div>
                </div>
                <div class="field">
                  <div class="field-label">Medical Department</div>
                  <div class="field-value">${bookedDetails.service}</div>
                </div>
                <div class="field">
                  <div class="field-label">Preferred Date & Time</div>
                  <div class="field-value">${bookedDetails.date} &mdash; ${bookedDetails.time}</div>
                </div>
                <div class="field">
                  <div class="field-label">Patient Contact</div>
                  <div class="field-value">${bookedDetails.phone}</div>
                </div>
                <div class="field">
                  <div class="field-label">Registered At</div>
                  <div class="field-value">${bookedDetails.registeredAt}</div>
                </div>
              </div>
              ${bookedDetails.message ? `
              <div class="reason-box">
                <div class="field-label">Reason Details</div>
                <div class="reason-val">"${bookedDetails.message}"</div>
              </div>
              ` : ''}
            </div>
            <div class="footer">
              We will connect you within 24 hours to confirm. A booking confirmation holding clinical slot details was registered successfully.<br>
              <strong>Situated near:</strong> Bypass Chauraha, Durgaganj Road, Suriyawan
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <section id="appointment" className="py-20 bg-white border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Appointment Engine
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Schedule Your Comprehensive Consultations
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed font-sans">
            Choose your preferred healthcare expert, pick a convenient calendar slot, and share your visual conditions.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          
          {/* Left panel: Quick assistance information */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            {/* Info plate */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-6">
              <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                <span>Scheduling Tips</span>
              </h3>
              
              <ul className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">1</span>
                  <span><strong>Dr. Abhishek Maurya</strong> is available daily (Monday-Sunday) for surgical checkups.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">2</span>
                  <span><strong>Dr. Priyanka Maurya</strong> is available Monday to Saturday for Ayurvedic and general ocular care.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">3</span>
                  <span>Emergency consultations are prioritized immediately upon walk-in or hotline notification.</span>
                </li>
              </ul>

              <div className="border-t border-slate-200/60 pt-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400">EMERGENCY HOTLINE</p>
                <a
                  href="tel:+919415080016"
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 px-4.5 py-3 w-full font-bold text-sm hover:bg-rose-100 transition-all text-center justify-center"
                >
                  <Phone className="h-4.5 w-4.5" />
                  <span>Call Emergency Now</span>
                </a>
              </div>
            </div>

            {/* Quick trust plate */}
            <div className="border border-slate-100 rounded-2xl p-6 flex gap-4 items-center bg-white shadow-sm">
              <ShieldCheck className="h-10 w-10 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-slate-800">100% HIPAA Compliant</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Your personal health records are protected with clinic confidentiality protocols.</p>
              </div>
            </div>

          </div>

          {/* Right panel: Scheduling Form */}
          <div className="lg:col-span-8 bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full name */}
                <div className="space-y-2">
                  <label htmlFor="name-input" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Full Patient Name <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="name-input"
                    name="name"
                    required
                    placeholder="Enter your first and last name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white shadow-xs"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-2">
                  <label htmlFor="phone-input" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>Phone Number <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    id="phone-input"
                    name="phone"
                    required
                    placeholder="e.g. +91 94150 80016"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white shadow-xs"
                  />
                </div>

                {/* Email (Optional) */}
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="email-input" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>Email Address <span className="text-slate-400">(Optional)</span></span>
                  </label>
                  <input
                    type="email"
                    id="email-input"
                    name="email"
                    placeholder="e.g. your-name@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* Clinic Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 pt-6">
                {/* Select Service */}
                <div className="space-y-2 relative">
                  <label htmlFor="service-select-btn" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                    <span>Required Eye Service <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <button
                      id="service-select-btn"
                      type="button"
                      onClick={() => {
                        setShowServiceDropdown(!showServiceDropdown);
                        setShowDoctorDropdown(false);
                        setShowCalendar(false);
                      }}
                      className="w-full text-left rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 transition-all bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer shadow-xs flex items-center justify-between"
                    >
                      <span className={formData.service ? "text-slate-800 font-medium" : "text-slate-400"}>
                        {formData.service || "-- Choose Eye Treatment --"}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${showServiceDropdown ? "rotate-90" : ""}`} />
                    </button>
                    {/* Hidden input to ensure native browser form submission still receives the value */}
                    <input
                      type="hidden"
                      name="service"
                      value={formData.service}
                      required
                    />
                  </div>

                  {showServiceDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setShowServiceDropdown(false)} 
                      />
                      <div className="absolute z-50 mt-1 left-0 right-0 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1">
                        {SERVICES.map(srv => (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, service: srv.title }));
                              setShowServiceDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                              formData.service === srv.title ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                            }`}
                          >
                            {srv.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Select Doctor */}
                <div className="space-y-2 relative">
                  <label htmlFor="doctor-select-btn" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-slate-400" />
                    <span>Preferred Doctor <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <button
                      id="doctor-select-btn"
                      type="button"
                      onClick={() => {
                        setShowDoctorDropdown(!showDoctorDropdown);
                        setShowServiceDropdown(false);
                        setShowCalendar(false);
                      }}
                      className="w-full text-left rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 transition-all bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer shadow-xs flex items-center justify-between"
                    >
                      <span className={formData.doctor ? "text-slate-800 font-medium" : "text-slate-400"}>
                        {formData.doctor || "-- Choose Doctor Specialist --"}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${showDoctorDropdown ? "rotate-90" : ""}`} />
                    </button>
                    {/* Hidden input to ensure native browser form submission still receives the value */}
                    <input
                      type="hidden"
                      name="doctor"
                      value={formData.doctor}
                      required
                    />
                  </div>

                  {showDoctorDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setShowDoctorDropdown(false)} 
                      />
                      <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl py-1">
                        {DOCTORS.map(doc => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, doctor: doc.name }));
                              setShowDoctorDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                              formData.doctor === doc.name ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                            }`}
                          >
                            <span className="block font-semibold">{doc.name}</span>
                            <span className="block text-xs text-slate-500">{doc.qualification}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Calendar Date picker */}
                <div className="space-y-2 sm:col-span-2 relative">
                  <label htmlFor="date-button" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <CalendarRange className="h-4 w-4 text-slate-400" />
                    <span>Select Appointment Date <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <button
                      id="date-button"
                      type="button"
                      onClick={() => {
                        setShowCalendar(!showCalendar);
                        setShowServiceDropdown(false);
                        setShowDoctorDropdown(false);
                      }}
                      className={`w-full text-left rounded-xl border border-slate-300 pl-4 pr-11 py-3 text-sm transition-all bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer shadow-xs font-sans flex items-center justify-between ${
                        formData.date ? 'text-slate-800 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {formData.date ? (
                        new Date(formData.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      ) : (
                        "Select Appointment Date"
                      )}
                    </button>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <CalendarRange className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Backdrop and Dropdown Calendar Panel */}
                  {showCalendar && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setShowCalendar(false)} 
                      />
                      <div className="absolute z-50 mt-1 left-0 right-0 max-w-full md:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 font-sans ring-1 ring-slate-100">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            disabled={isPrevMonthDisabled()}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-sm text-slate-800">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-1.5">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="py-0.5">{d}</div>
                          ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: firstDayIndex }).map((_, idx) => (
                            <div key={`empty-${idx}`} />
                          ))}
                          
                          {Array.from({ length: totalDays }).map((_, idx) => {
                            const day = idx + 1;
                            const disabled = isPastDate(day);
                            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = formData.date === dateStr;

                            return (
                              <button
                                key={day}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleDateSelect(day)}
                                className={`py-1.5 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-100'
                                    : disabled
                                    ? 'text-slate-200 cursor-not-allowed opacity-50'
                                    : 'text-slate-700 hover:bg-slate-100 active:scale-95 hover:text-blue-600'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-2 border-t border-slate-100 pt-6">
                <span className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1 mb-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Choose Time Slot <span className="text-rose-500">*</span></span>
                </span>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className={`text-xs font-bold py-2.5 rounded-lg border text-center transition-all active:scale-95 cursor-pointer ${
                        formData.time === slot
                          ? 'bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message / Symptoms description */}
              <div className="space-y-2 border-t border-slate-100 pt-6">
                <label htmlFor="message-textarea" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <span>Message & Symptoms <span className="text-slate-400">(Optional)</span></span>
                </label>
                <textarea
                  id="message-textarea"
                  name="message"
                  rows={3}
                  placeholder="Share details such as eye pain, blurry vision, double vision, headache, etc."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white shadow-xs"
                />
              </div>

              {/* Error messages feedback */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs sm:text-sm font-medium rounded-xl leading-relaxed">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="ripple w-full inline-flex items-center justify-center rounded-lg bg-blue-700 hover:bg-blue-800 py-4 font-bold text-white transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Booking Your Secure Slot...</span>
                    </span>
                  ) : (
                    <span>Register Appointment Request</span>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>

      {/* Success Modal Alert */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSuccess(false);
                setBookedDetails(null);
              }}
              className="fixed inset-0"
            />
            
            {/* Alert container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md overflow-y-auto max-h-[95vh] rounded-3xl bg-white p-4.5 sm:p-5 text-center shadow-2xl border border-slate-100 space-y-4 font-sans"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                <CheckCircle className="h-6 w-6" />
              </div>

              {/* Status Header Plate */}
              <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-2xl p-3 text-center space-y-1">
                <h3 className="font-display text-base font-extrabold text-slate-900">Appointment Booked!</h3>
                <p className="text-[10.5px] text-slate-600 leading-normal font-medium max-w-xs mx-auto">
                  We will connect you within 24 hours to confirm. A booking confirmation holding clinical slot details was registered successfully.
                </p>
              </div>

              {/* Visit Voucher Summary Card */}
              {bookedDetails && (
                <div id="printable-voucher-card" className="border border-slate-200 bg-slate-50/20 rounded-2xl p-3 text-left space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-[9px] font-mono font-extrabold tracking-wider text-blue-700">
                      VISIT VOUCHER SUMMARY
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md">
                      TICKET: {bookedDetails.ticketId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3.5 gap-y-2 text-xs">
                    <div>
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">PATIENT NAME</div>
                      <div className="font-extrabold text-slate-800 truncate">{bookedDetails.name}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">SPECIALIST DOCTOR</div>
                      <div className="font-extrabold text-slate-800 truncate">{bookedDetails.doctor}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">MEDICAL DEPARTMENT</div>
                      <div className="font-extrabold text-slate-800 truncate">{bookedDetails.service}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">PREFERRED DATE & TIME</div>
                      <div className="font-extrabold text-slate-800 text-[11px] leading-tight">{bookedDetails.date} — {bookedDetails.time}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">PATIENT CONTACT</div>
                      <div className="font-extrabold text-slate-800 truncate font-mono">{bookedDetails.phone}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">REGISTERED AT</div>
                      <div className="font-extrabold text-slate-800 truncate">{bookedDetails.registeredAt}</div>
                    </div>
                  </div>

                  {bookedDetails.message && (
                    <div className="border-t border-slate-100 pt-2">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight">REASON DETAILS</div>
                      <div className="text-xs italic text-slate-600 mt-0.5 leading-relaxed font-medium">
                        "{bookedDetails.message}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer active:scale-95"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setBookedDetails(null);
                  }}
                  className="flex-1 rounded-xl bg-blue-700 hover:bg-blue-800 py-2.5 text-xs font-bold text-white transition cursor-pointer active:scale-95 shadow-sm shadow-blue-100"
                >
                  Reserve Another Appointment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
