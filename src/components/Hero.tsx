/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Phone, Calendar, ShieldCheck, Award, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function Hero({ onScrollToSection }: HeroProps) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white py-16 lg:py-24 border-b border-slate-200"
    >
      {/* Background visual split gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent w-full lg:w-1/2 -z-10" />
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-50/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-indigo-50/30 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Heading and Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              11+ Years of Clinical Excellence
            </div>
 
            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Advanced Eye Care for a <br />
              <span className="text-blue-700 relative">
                Clearer Tomorrow.
                <svg className="absolute left-0 right-0 -bottom-2 h-2 text-blue-300" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
 
            {/* Sub-headline */}
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Leading eye specialists in Suriyawan, providing comprehensive visual diagnostics, computerized eye testing, advanced cataract assessments, and precision ocular therapy checkups.
            </p>
 
            {/* Credentials Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Certified Specialists</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Eye className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Modern Diagnostics</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-blue-700 font-extrabold text-sm sm:text-base">100%</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-700">Patient Centered</span>
              </div>
            </div>
 
            {/* Primary Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                id="hero-book-btn"
                onClick={() => onScrollToSection('appointment')}
                className="ripple w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-8 py-3 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-800 active:scale-95 transition-all cursor-pointer"
              >
                <span>Schedule Visit</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <a
                href="tel:+919415080016"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white text-slate-700 px-8 py-3 font-bold hover:bg-slate-50 hover:text-blue-700 active:scale-95 transition-all"
              >
                <span>Emergency Case</span>
              </a>
            </div>
 
          </div>
 
          {/* Right: Hospital branding / PNG Logo Display */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl flex flex-col justify-between"
            >
              {/* Corner decorative design */}
              <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-slate-200" />
              <div className="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-slate-200" />
              <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-slate-200" />
              <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-slate-200" />
 
              {/* Sub-label */}
              <div className="text-center font-display text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Official Clinical Symbol
              </div>
 
              {/* Centered PNG Logo */}
              <div className="flex-1 flex items-center justify-center py-6">
                <div className="relative group p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50">
                  {/* Subtle ring animation */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/10 scale-95 group-hover:scale-105 group-hover:border-blue-500/20 transition-all duration-500" />
                  
                  <img
                    src="https://www.image2url.com/r2/default/images/1782879527609-684eb0b5-799a-47dc-a09b-34fcf3b466b0.png"
                    alt="Priyanka Eye Care symbol"
                    className="h-44 sm:h-52 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const iconFallback = document.createElement('div');
                        iconFallback.className = 'w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-5xl font-bold';
                        iconFallback.innerHTML = 'PEC';
                        parent.appendChild(iconFallback);
                      }
                    }}
                  />
                </div>
              </div>
 
              {/* Footer labels inside visual frame */}
              <div className="text-center border-t border-slate-100 pt-3">
                <p className="font-display text-sm font-extrabold text-blue-900 tracking-wide uppercase">Priyanka Eye Care</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Suriyawan, Bhadohi | Bypass Chauraha</p>
              </div>
 
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
