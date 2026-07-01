/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, HeartHandshake, Eye, Award, BadgeCheck, Users, HelpCircle } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      title: '11+ Years Experience',
      desc: 'Over a decade of successful medical ophthalmic service supporting thousands of patients in the Bhadohi region.',
      icon: Award,
      color: 'text-amber-800 bg-amber-100'
    },
    {
      title: 'Certified Eye Specialists',
      desc: 'Expert care delivered by fully certified specialists Dr. Abhishek Maurya and Dr. Priyanka Maurya.',
      icon: ShieldCheck,
      color: 'text-blue-800 bg-blue-100'
    },
    {
      title: 'Advanced Eye Diagnostics',
      desc: 'Equipped with computerized automated refractometers and precise vision profiling instruments.',
      icon: Eye,
      color: 'text-purple-800 bg-purple-100'
    },
    {
      title: 'Patient Focused Integrity',
      desc: 'We place the therapeutic interests, physical comfort, and clear comprehension of our patients above all else.',
      icon: HeartHandshake,
      color: 'text-emerald-800 bg-emerald-100'
    },
    {
      title: 'Affordable Treatments',
      desc: 'Premium diagnostics, frame fittings, and medical eye consultations scaled at accessible local prices.',
      icon: BadgeCheck,
      color: 'text-teal-800 bg-teal-100'
    },
  ];

  return (
    <section id="about" className="py-20 bg-white border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Who We Are
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Priyanka Eye Care Hospital
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed font-sans">
            Establishing the absolute standard of trustworthy, dedicated, and highly accessible ophthalmic medicine and refractive eye care for Suriyawan and surrounding districts.
          </p>
        </div>

        {/* Story & Split Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-display text-2xl font-bold text-slate-800">
              Your Vision Is Our Ultimate Specialty
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Founded on the belief that pristine vision is a fundamental right, Priyanka Eye Care has spent over 11 years diagnosing, treating, and managing diverse visual disorders. From computer-induced digital strain in young professionals to complex age-related macular changes and cataracts in elders, we deliver customized, premium treatments.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Under the expert, patient-first guidelines of Dr. Abhishek Maurya (MS Ophthalmology) and Dr. Priyanka Maurya (BAMS), our clinic has earned a reputation for surgical assessment accuracy, honest spectacles prescribing, and highly sympathetic care.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <h4 className="font-display font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Our Core Mission
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  To eliminate preventable blindness and enhance ocular health in the region through computerized screening, precise optics, and compassionate counseling.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Our Long-term Vision
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  To become the leading advanced, multi-specialty micro-surgery center in Bhadohi, integrating traditional care empathy with modern high-speed diagnostics.
                </p>
              </div>
            </div>
          </div>

          {/* Right Cards Pillar Grid */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Why Choose Us?
            </h3>
            <div className="space-y-3.5">
              {pillars.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${item.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display text-base font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
