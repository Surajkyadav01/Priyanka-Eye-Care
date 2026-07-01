/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data';

export default function FAQs() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Patient Support
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Eye Questions
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
        </div>

        {/* Accordion Wrapper */}
        <div className="space-y-3.5">
          {FAQS.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-blue-300 transition-all duration-300"
              >
                {/* Header */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left font-display text-sm sm:text-base font-bold text-slate-800 hover:text-blue-700 transition duration-200 cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-700 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Body Content */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-60 opacity-100 border-t border-slate-200 bg-slate-50 py-4.5 px-6' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
                    {faq.answer}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
