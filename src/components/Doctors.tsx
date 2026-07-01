/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Award, GraduationCap, Clock, Stethoscope } from 'lucide-react';
import { DOCTORS } from '../data';
import { Doctor } from '../types';

interface DoctorsProps {
  onSelectDoctor: (doctorName: string) => void;
}

export default function Doctors({ onSelectDoctor }: DoctorsProps) {
  return (
    <section id="doctors" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Our Specialists
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Certified Doctors
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed">
            Priyanka Eye Care houses highly qualified and dedicated healthcare professionals, delivering clinical excellence with warm personal care.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {DOCTORS.map((doc: Doctor) => (
            <div
              key={doc.id}
              className="group bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              
              {/* Doctor Header Banner and Image */}
              <div className="relative">
                {/* Visual accent top banner */}
                <div className="h-24 bg-gradient-to-r from-blue-700 to-blue-900" />
                
                {/* Doctor Avatar circle */}
                <div className="absolute top-10 left-6">
                  <div className="relative h-28 w-28 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-md">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image in case Unsplash fails
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const initial = document.createElement('div');
                          initial.className = 'w-full h-full bg-blue-100 text-blue-700 font-display font-extrabold text-3xl flex items-center justify-center';
                          initial.innerText = doc.name.charAt(4); // "A" or "P"
                          parent.appendChild(initial);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="px-6 pb-6 pt-16 flex-1 space-y-6">
                
                {/* Title */}
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
                    {doc.name}
                  </h3>
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">{doc.qualification}</p>
                </div>

                {/* Badges/Credentials */}
                <div className="space-y-3.5 border-t border-slate-100 pt-4">
                  
                  {/* Specialization */}
                  <div className="flex gap-2 text-sm text-slate-600">
                    <Stethoscope className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Specialization:</span>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{doc.specialization}</p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex gap-2 text-sm text-slate-600">
                    <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Experience:</span>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{doc.experience}</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Availability:</span>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 bg-slate-100 px-2 py-1 rounded">
                        {doc.availableDays.join(' • ')}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Action */}
              <div className="px-6 pb-6 bg-slate-50 border-t border-slate-100 pt-4">
                <button
                  onClick={() => onSelectDoctor(doc.name)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-sm font-bold text-white py-3 transition-all active:scale-95 shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200"
                >
                  <Calendar className="h-4.5 w-4.5" />
                  <span>Book with {doc.name.split(' ')[1]}</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
