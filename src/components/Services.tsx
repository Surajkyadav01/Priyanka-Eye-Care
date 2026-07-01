/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Eye, Monitor, Activity, Sparkles, Glasses, Smile,
  ShieldAlert, HeartPulse, RefreshCw, Zap, Circle,
  Scissors, Heart, AlertTriangle, ArrowRight, ClipboardCheck
} from 'lucide-react';
import { SERVICES } from '../data';
import { Service } from '../types';

interface ServicesProps {
  onSelectService: (serviceTitle: string) => void;
}

// Helper to resolve icon components dynamically
const getIcon = (name: string) => {
  switch (name) {
    case 'Eye': return Eye;
    case 'Monitor': return Monitor;
    case 'Activity': return Activity;
    case 'Sparkles': return Sparkles;
    case 'Glasses': return Glasses;
    case 'Smile': return Smile;
    case 'ShieldAlert': return ShieldAlert;
    case 'HeartPulse': return HeartPulse;
    case 'RefreshCw': return RefreshCw;
    case 'Zap': return Zap;
    case 'Circle': return Circle;
    case 'Scissors': return Scissors;
    case 'Heart': return Heart;
    case 'AlertTriangle': return AlertTriangle;
    default: return Eye;
  }
};

export default function Services({ onSelectService }: ServicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter services dynamically by patient inquiry
  const filteredServices = SERVICES.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="services" className="py-20 bg-white border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Clinical Services
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Advanced Ophthalmic Care
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed font-sans">
            Equipped with modern visual analysis suites, Priyanka Eye Care delivers surgical assessments, computer vision therapies, and complete preventative medicine.
          </p>
        </div>

        {/* Search Bar filter */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              id="service-search"
              placeholder="Search services (e.g., Cataract, LASIK, Vision)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-200 px-5 py-3.5 pl-12 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Eye className="h-4.5 w-4.5" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Showing {filteredServices.length} of {SERVICES.length} eye treatments
            </p>
          )}
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv: Service) => {
            const IconComp = getIcon(srv.icon);
            return (
              <div
                key={srv.id}
                className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/[0.02] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Icon Plate */}
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 group-hover:bg-blue-700 group-hover:text-white mb-3 transition-all duration-300">
                    <IconComp className="h-5 w-5" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-display font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                    {srv.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-snug">
                    {srv.description}
                  </p>
                </div>

                {/* Footer Selection Button */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase">
                    <ClipboardCheck className="h-3 w-3" />
                    <span>Diagnostics</span>
                  </span>
                  
                  <button
                    onClick={() => onSelectService(srv.title)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-700 transition-all cursor-pointer"
                  >
                    <span>Schedule</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No matching services found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search filter words above.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Reset Search
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
