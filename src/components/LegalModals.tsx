/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'refund' | 'disclaimer' | 'cookie' | null;
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy - Priyanka Eye Care',
          body: (
            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Effective Date: June 30, 2026</p>
              <p>At Priyanka Eye Care, accessible from our clinic in Suriyawan, Bhadohi and our online portal, one of our main priorities is the privacy of our patients. This Privacy Policy document contains types of information that is collected and recorded by Priyanka Eye Care and how we use it.</p>
              
              <h4 className="font-semibold text-slate-800 pt-2">1. Patient Medical Information Protection</h4>
              <p>We adhere to patient confidentiality standards. Any medical history, diagnostic images, refraction results, or vision files collected in-person or requested online are securely cataloged and are never shared with any unauthorized third-party entity.</p>

              <h4 className="font-semibold text-slate-800 pt-2">2. Information We Collect</h4>
              <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information (e.g., booking an appointment online, full name, email address, telephone number, and message notes).</p>

              <h4 className="font-semibold text-slate-800 pt-2">3. How We Use Your Information</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>To record, confirm, and manage your clinical appointments.</li>
                <li>To reach out to you via SMS, Phone Call, or Email for scheduling changes or emergency alerts.</li>
                <li>To send notification alerts to our medical officers regarding your requested services.</li>
                <li>To maintain medical checkup records as mandated by Indian healthcare regulations.</li>
              </ul>

              <h4 className="font-semibold text-slate-800 pt-2">4. Data Security</h4>
              <p>We use robust server security measures, local file encryptions, and access-controlled portals to guarantee that your clinical details remain protected against unauthorized leakages, alterations, or loss.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms & Conditions - Priyanka Eye Care',
          body: (
            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Last Updated: June 30, 2026</p>
              <p>Welcome to Priyanka Eye Care! These terms and conditions outline the rules and regulations for the use of Priyanka Eye Care Clinic Website and on-premise hospital services located in Suriyawan, Bhadohi.</p>

              <h4 className="font-semibold text-slate-800 pt-2">1. Medical Services & Diagnosis</h4>
              <p>By scheduling an appointment, you acknowledge that online bookings are pre-registrations. Final prescriptions, glasses recommendations, or surgery plans are only generated after an in-person diagnostic evaluation by Dr. Abhishek Maurya or Dr. Priyanka Maurya at our clinic premises.</p>

              <h4 className="font-semibold text-slate-800 pt-2">2. Appointment Rescheduling</h4>
              <p>While we make every effort to accommodate scheduled slots, clinical emergencies, urgent surgeries, or power schedules might occasionally require us to adjust timing. We request your patience in such scenarios.</p>

              <h4 className="font-semibold text-slate-800 pt-2">3. Accuracy of Patient Data</h4>
              <p>You agree to provide accurate, up-to-date, and complete contact details (name, phone number) when booking appointments or submitting feedback to ensure seamless notification routing.</p>

              <h4 className="font-semibold text-slate-800 pt-2">4. Intellectual Property</h4>
              <p>All clinical content, diagrams, images, and branding assets on this website are the property of Priyanka Eye Care and may not be reproduced without written permission.</p>
            </div>
          )
        };
      case 'refund':
        return {
          title: 'Refund Policy - Priyanka Eye Care',
          body: (
            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Refund Policy for Services & Spectacles</p>
              <p>Our goal is to ensure the absolute satisfaction of every patient regarding their eye care experience.</p>

              <h4 className="font-semibold text-slate-800 pt-2">1. Clinical Consultations & Testing</h4>
              <p>Consultation fees paid for clinical testing, computerized eye examinations, retina screening, or diagnostic evaluations are non-refundable once the test has been completed by our clinical staff.</p>

              <h4 className="font-semibold text-slate-800 pt-2">2. Spectacles and Lenses</h4>
              <p>Spectacle lenses are custom-ground according to individual focal prescriptions and pupillary distance measurements. Hence, custom lenses are non-refundable once the grinding process begins. However, if there is a verified technical measurement error on our end, we will replace the lenses free of cost within 7 days of delivery.</p>

              <h4 className="font-semibold text-slate-800 pt-2">3. Frame Replacements</h4>
              <p>Frames purchased from our clinical optical section can be exchanged for an alternative model within 3 days of purchase, provided the item is in pristine, unused condition with original bills and packaging intact.</p>
            </div>
          )
        };
      case 'disclaimer':
        return {
          title: 'Medical Disclaimer - Priyanka Eye Care',
          body: (
            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Critical Clinical Notice</p>
              <p>The information provided on this website, including services text, blogs, guidelines, and FAQs, is for general educational and informational purposes only.</p>

              <h4 className="font-semibold text-slate-800 pt-2">1. No Doctor-Patient Relationship</h4>
              <p>Reading this website, submitting an appointment registration form, or contacting us through digital means does not constitute or establish a formal doctor-patient relationship. A formal relationship is only initiated when you undergo clinical checkup with our doctors on site.</p>

              <h4 className="font-semibold text-slate-800 pt-2">2. Emergency Medical Help</h4>
              <p>Do NOT rely on our online contact forms or digital responses for immediate emergency situations (such as acute ocular chemical splash, physical eyeball perforation, or sudden complete blindness). Please visit our clinic immediately or call our critical hotlines directly for immediate intervention.</p>
            </div>
          )
        };
      case 'cookie':
        return {
          title: 'Cookie Policy - Priyanka Eye Care',
          body: (
            <div className="space-y-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Cookie and Tracking Policy</p>
              <p>Priyanka Eye Care website uses standard browser cookies to elevate your interactive browsing experience.</p>

              <h4 className="font-semibold text-slate-800 pt-2">1. What are Cookies?</h4>
              <p>Cookies are small text files downloaded by your browser to remember your preferences, active sessions, and local page configurations.</p>

              <h4 className="font-semibold text-slate-800 pt-2">2. How we Use Cookies</h4>
              <p>We use cookies to retain your logged-in administrator sessions on the Admin Panel, preserve user interface preferences (like close states on banners), and assess anonymous website traffic to improve page speed and layout responsiveness.</p>

              <h4 className="font-semibold text-slate-800 pt-2">3. Disabling Cookies</h4>
              <p>You can choose to disable cookies through your individual browser options. However, please note that disabling session cookies will prevent the secure Administrator Panel from authenticating you successfully.</p>
            </div>
          )
        };
      default:
        return { title: '', body: null };
    }
  };

  const { title, body } = getContent();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="legal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          id="legal-content-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
            <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
            <button
              id="close-legal-modal"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto px-6 py-6 leading-relaxed">
            {body}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-slate-100 px-6 py-4 bg-slate-50">
            <button
              id="confirm-legal-modal"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all"
            >
              Close Policy
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
