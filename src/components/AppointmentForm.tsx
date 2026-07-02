/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CalendarRange, UserCheck, Stethoscope, Clock, ShieldCheck, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { SERVICES, DOCTORS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

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
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok && result.success) {
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
        setError(result.error || 'Something went wrong. Please check inputs and retry.');
      }
    } catch (err) {
      console.error('Error submitting appointment:', err);
      setError('Network communication failed. Please check internet and try again.');
    } finally {
      setLoading(false);
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
                <div className="space-y-2">
                  <label htmlFor="service-select" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Stethoscope className="h-4 w-4 text-slate-400" />
                    <span>Required Eye Service <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    id="service-select"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white cursor-pointer shadow-xs"
                  >
                    <option value="">-- Choose Eye Treatment --</option>
                    {SERVICES.map(srv => (
                      <option key={srv.id} value={srv.title}>{srv.title}</option>
                    ))}
                  </select>
                </div>

                {/* Select Doctor */}
                <div className="space-y-2">
                  <label htmlFor="doctor-select" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <UserCheck className="h-4 w-4 text-slate-400" />
                    <span>Preferred Doctor <span className="text-rose-500">*</span></span>
                  </label>
                  <select
                    id="doctor-select"
                    name="doctor"
                    required
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white cursor-pointer shadow-xs"
                  >
                    <option value="">-- Choose Doctor Specialist --</option>
                    {DOCTORS.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name} ({doc.qualification})</option>
                    ))}
                  </select>
                </div>

                {/* Calendar Date picker */}
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="date-input" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <CalendarRange className="h-4 w-4 text-slate-400" />
                    <span>Select Appointment Date <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    id="date-input"
                    name="date"
                    required
                    min={new Date().toISOString().split('T')[0]} // Block historical dates
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 focus:bg-white cursor-pointer shadow-xs font-sans"
                  />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccess(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Alert container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-slate-100"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <h3 className="font-display text-xl font-bold text-slate-900">Appointment Registered!</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Thank you for scheduling your consultation. A secure notification has been dispatched to <strong>ksurajyadav93@gmail.com</strong>.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-4 my-4 text-left border border-slate-100 text-xs text-slate-600 leading-relaxed">
                We are situated near <strong>Bypass Chauraha, Durgaganj Road, Suriyawan</strong>. Our coordinator will contact you shortly if any rescheduling is required.
              </div>

              <button
                id="close-success-booking"
                onClick={() => setSuccess(false)}
                className="w-full rounded-lg bg-blue-700 py-3 text-sm font-bold text-white hover:bg-blue-800 transition"
              >
                Close & Return
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
