/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const form = e.target as HTMLFormElement;
    form.reset();
    setTimeout(() => {
      setSubmitted(false);
    }, 6000);
  };

  return (
    <section id="contact" className="py-20 bg-white border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Our Location
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visit Priyanka Eye Care Hospital
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed font-sans">
            Centrally situated at Bypass Chauraha, Suriyawan. Drop by for complete optical prescribing or computerized tests.
          </p>
        </div>

        {/* Info Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Contact Coordinates */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Coordinates Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-md">
              <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                Clinic Details
              </h3>
              
              <div className="space-y-5">
                {/* Address */}
                <div className="flex gap-3 text-slate-600">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0 self-start">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-sm leading-relaxed">
                    <p className="font-bold text-slate-800">Address Details</p>
                    <p className="text-slate-500 mt-1 text-xs leading-relaxed">
                      Priyanka Eye Care,<br />
                      Suriyawan, Near Bypass Chauraha,<br />
                      Durgaganj Road, Bhadohi,<br />
                      Uttar Pradesh - 221404
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex gap-3 text-slate-600">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">Phone & Support</p>
                    <p className="mt-1">
                      <a href="tel:+919415080016" className="text-slate-500 hover:text-blue-700 font-semibold font-mono">
                        +91 94150 80016
                      </a>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-3 text-slate-600">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">Official Email</p>
                    <p className="text-slate-500 mt-1">support@priyankaeyecare.com</p>
                  </div>
                </div>

                {/* Opening hours */}
                <div className="flex gap-3 text-slate-600">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-800">Hours of Operation</p>
                    <p className="text-slate-500 mt-1 font-semibold">Open Daily: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Map Directions anchor */}
            <a
              href="https://maps.app.goo.gl/DG3Usd7TybKX45nZ6?g_st=ac"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 text-white font-bold text-sm px-6 py-4.5 w-full shadow hover:bg-blue-800 transition active:scale-95 text-center shadow-lg shadow-blue-100"
            >
              <MapPin className="h-4.5 w-4.5" />
              <span>Get GPS Navigation Directions</span>
            </a>

          </div>

          {/* Center Panel: Quick inquiry Form */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
            <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Send Quick Enquiry
            </h3>

            <form onSubmit={handleSubmitEnquiry} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="enquiry-name" className="text-xs font-semibold text-slate-600">Your Name</label>
                <input
                  type="text"
                  id="enquiry-name"
                  required
                  placeholder="Enter name..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-700 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="enquiry-phone" className="text-xs font-semibold text-slate-600">Phone Number</label>
                <input
                  type="tel"
                  id="enquiry-phone"
                  required
                  placeholder="Enter phone number..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-700 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="enquiry-msg" className="text-xs font-semibold text-slate-600">Your Inquiry</label>
                <textarea
                  id="enquiry-msg"
                  required
                  rows={3}
                  placeholder="What is your query about?"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-700 bg-slate-50 focus:bg-white transition"
                />
              </div>

              {submitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Enquiry dispatched! We will contact you shortly.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 py-3 font-bold text-white text-xs transition cursor-pointer shadow-md shadow-blue-100"
              >
                <Send className="h-3 w-3" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Right Panel: Embedded Map Iframe */}
          <div className="lg:col-span-4 h-full min-h-[350px] rounded-2xl border border-slate-200 overflow-hidden shadow-md bg-white relative">
            <iframe
              title="Google Map of Priyanka Eye Care"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.6347101256336!2d82.4678!3d25.3475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDIwJzUxLjAiTiA4MsKwMjgnMDQuMSJF!5e0!3m2!1sen!2sin!4v1656200000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              className="absolute inset-0 border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
