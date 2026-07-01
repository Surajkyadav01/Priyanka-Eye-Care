/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, MapPin, Phone, Mail, Clock, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (policyType: 'privacy' | 'terms' | 'refund' | 'disclaimer' | 'cookie') => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Footer({ onOpenPolicy, onScrollToSection }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onScrollToSection(id);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-slate-900 pb-12 mb-10">
          
          {/* Column 1: Hospital identity info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-auto bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                <img
                  src="https://www.image2url.com/r2/default/images/1782880574840-02cdda6c-38b5-403e-9c3a-bb74b89fe697.png"
                  alt="Priyanka Eye Care Logo"
                  className="h-full w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight uppercase">Priyanka Eye Care</span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Suriyawan’s premium computerized optical hub and specialized diagnostic Eye Care clinic, delivered under certified ophthalmologist Dr. Abhishek Maurya and general practitioner Dr. Priyanka Maurya.
            </p>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Accreditation</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Certified Ophthalmic & Refraction Clinic</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation links */}
          <div className="lg:col-span-2.5 space-y-4">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <a href="#home" onClick={(e) => handleLinkClick(e, 'home')} className="hover:text-blue-400 transition">Home</a>
              <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-blue-400 transition">About Clinic</a>
              <a href="#services" onClick={(e) => handleLinkClick(e, 'services')} className="hover:text-blue-400 transition">Services</a>
              <a href="#gallery" onClick={(e) => handleLinkClick(e, 'gallery')} className="hover:text-blue-400 transition">Infrastructure</a>
              <a href="#appointment" onClick={(e) => handleLinkClick(e, 'appointment')} className="hover:text-blue-400 transition">Book Appointment</a>
              <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')} className="hover:text-blue-400 transition">Contact & Maps</a>
              <a href="#feedback" onClick={(e) => handleLinkClick(e, 'feedback')} className="hover:text-blue-400 transition">Submit Feedback</a>
            </div>
          </div>

          {/* Column 3: Featured treatment lists */}
          <div className="lg:col-span-2.5 space-y-4">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Specialties</h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <span>Computer Vision Diagnostics</span>
              <span>Computerized Eye Checkup</span>
              <span>Advanced Cataract Screening</span>
              <span>Children Ocular Care</span>
              <span>Corneal Fit Contact Lenses</span>
              <span>Premium Spectacles Prescription</span>
              <span>Glaucoma & Retina Checkup</span>
            </div>
          </div>

          {/* Column 4: Operational hours details */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">Clinic Timing</h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex gap-2.5">
                <Clock className="h-4.5 w-4.5 text-blue-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-200">Daily Opening Hours</p>
                  <p className="text-xs text-slate-400 mt-1">Monday - Sunday</p>
                  <p className="text-xs text-slate-200 mt-0.5">09:00 AM - 08:00 PM</p>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1.5">
                <Phone className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-200">Emergency Call</p>
                  <a href="tel:+919415080016" className="text-xs text-slate-300 hover:text-blue-400 font-bold block mt-1">
                    +91 94150 80016
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Legal Policies Agreement Rails */}
        <div className="flex flex-wrap items-center justify-center lg:justify-between gap-4 text-xs text-slate-500 mb-8 border-b border-slate-900 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button onClick={() => onOpenPolicy('privacy')} className="hover:text-blue-400 transition cursor-pointer">Privacy Policy</button>
            <span className="hidden sm:inline text-slate-800">•</span>
            <button onClick={() => onOpenPolicy('terms')} className="hover:text-blue-400 transition cursor-pointer">Terms & Conditions</button>
            <span className="hidden sm:inline text-slate-800">•</span>
            <button onClick={() => onOpenPolicy('refund')} className="hover:text-blue-400 transition cursor-pointer">Refund Policy</button>
            <span className="hidden sm:inline text-slate-800">•</span>
            <button onClick={() => onOpenPolicy('disclaimer')} className="hover:text-blue-400 transition cursor-pointer">Medical Disclaimer</button>
            <span className="hidden sm:inline text-slate-800">•</span>
            <button onClick={() => onOpenPolicy('cookie')} className="hover:text-blue-400 transition cursor-pointer">Cookie Policy</button>
          </div>

          <div className="flex items-center gap-1">
            <ShieldAlert className="h-4 w-4 text-amber-500/70" />
            <span className="text-[10px] text-slate-600">Form submissions are secured under HTTPS TLS.</span>
          </div>
        </div>

        {/* Bottom copyright alignment */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center md:text-left leading-relaxed">
            <p>© {currentYear} Priyanka Eye Care. All Rights Reserved.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Suriyawan, Bhadohi, Bypass Chauraha, Durgaganj Road, 221404.</p>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for clearer community vision.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
