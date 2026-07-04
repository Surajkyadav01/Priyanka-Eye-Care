/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Doctors from './components/Doctors';
import Services from './components/Services';
import Gallery from './components/Gallery';
import AppointmentForm from './components/AppointmentForm';
import Contact from './components/Contact';
import FAQs from './components/FAQs';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import LegalModal from './components/LegalModals';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // States to hold appointment selections from other sections
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedService, setSelectedService] = useState('');

  // States for Legal Modals
  const [legalPolicyType, setLegalPolicyType] = useState<'privacy' | 'terms' | 'refund' | 'disclaimer' | 'cookie' | null>(null);

  // Ref flags to prevent scroll spy from overriding programmatic clicks
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Scroll to section helper
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      isScrollingRef.current = true;
      setActiveSection(sectionId);
      el.scrollIntoView({ behavior: 'smooth' });
      
      // Keep isScrollingRef true until the smooth scroll completes
      scrollTimeoutRef.current = window.setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  // Sync / fetch unread badge from backend or Firebase Firestore directly
  const fetchUnreadBadge = async () => {
    let isDbSuccess = false;
    try {
      // 1. Attempt client-side fetch directly from Firebase Firestore
      const q = query(collection(db, 'appointments'), where('isRead', '==', false));
      const querySnapshot = await getDocs(q);
      setUnreadCount(querySnapshot.size);
      isDbSuccess = true;
      console.log('Successfully fetched unread badge count from Firebase directly:', querySnapshot.size);
    } catch (fbErr) {
      console.warn('Direct Firebase unread-badge fetch failed, trying backend server fallback:', fbErr);
      
      // 2. Fallback: Try fetching from backend server
      try {
        const response = await fetch('/api/appointments/unread-badge');
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.unreadCount === 'number') {
            setUnreadCount(data.unreadCount);
            isDbSuccess = true;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch unread badge from server:', err);
      }
    }

    if (!isDbSuccess) {
      // 3. Fallback: Local storage unread count for offline mode
      try {
        const localAptsStr = localStorage.getItem('pec_local_appointments') || '[]';
        const localApts = JSON.parse(localAptsStr);
        const unread = localApts.filter((apt: any) => !apt.isRead).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error('Error parsing offline appointments unread count:', e);
      }
    }
  };

  useEffect(() => {
    fetchUnreadBadge();
    
    // Check if URL specifies starting on admin portal
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setAdminOpen(true);
    }

    // Listener for local appointments changes
    const handleLocalChange = () => {
      fetchUnreadBadge();
    };
    window.addEventListener('local_appointments_changed', handleLocalChange);

    // Setup real-time listener on Firebase Firestore
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const q = query(collection(db, 'appointments'), where('isRead', '==', false));
      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        setUnreadCount(querySnapshot.size);
        console.log('Real-time unread badge count updated from Firestore:', querySnapshot.size);
      }, (fbErr) => {
        console.warn('Direct Firebase real-time subscription failed, falling back to polling:', fbErr);
        try {
          handleFirestoreError(fbErr, OperationType.GET, 'appointments');
        } catch (e) {
          // Prevent throwing directly if we want to gracefully degrade to fetchUnreadBadge
          fetchUnreadBadge();
        }
      });
    } catch (err) {
      console.warn('Could not establish real-time Firestore listener:', err);
    }

    // Polling interval to check for new bookings on admin portal (every 12 seconds)
    const interval = setInterval(fetchUnreadBadge, 12000);

    // Scroll listener for back-to-top button and active navigation highlighting
    const handleScroll = () => {
      // Show/hide Back to Top
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // If programmatically scrolling (e.g. from nav click), do not let scroll spy override active section
      if (isScrollingRef.current) {
        return;
      }

      // Check current visible section
      const sections = ['home', 'about', 'doctors', 'services', 'gallery', 'appointment', 'contact', 'feedback'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
      window.removeEventListener('local_appointments_changed', handleLocalChange);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Hook triggered when a card select triggers scheduling
  const handleSelectDoctor = (doctorName: string) => {
    setSelectedDoctor(doctorName);
    handleScrollToSection('appointment');
  };

  const handleSelectService = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    handleScrollToSection('appointment');
  };

  const handleOpenPolicy = (type: 'privacy' | 'terms' | 'refund' | 'disclaimer' | 'cookie') => {
    setLegalPolicyType(type);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Header / Sticky Navigation */}
      <Navbar
        unreadCount={unreadCount}
        onOpenAdmin={() => setAdminOpen(true)}
        onScrollToSection={handleScrollToSection}
        activeSection={activeSection}
      />

      {/* Main Pages Content */}
      <main className="flex-1">
        {/* Hero Clinical Banner */}
        <Hero onScrollToSection={handleScrollToSection} />

        {/* Clinical History & Pillars */}
        <About />

        {/* Certified Doctor Cards */}
        <Doctors onSelectDoctor={handleSelectDoctor} />

        {/* Service Cards Catalogue */}
        <Services onSelectService={handleSelectService} />

        {/* Dynamic Masonry Gallery */}
        <Gallery />

        {/* Interactive Scheduling engine */}
        <AppointmentForm
          selectedDoctor={selectedDoctor}
          selectedService={selectedService}
          onAppointmentBooked={fetchUnreadBadge}
        />

        {/* Contact info, Iframe directions & Enquiry forms */}
        <Contact />

        {/* FAQ Accordion list */}
        <FAQs />

        {/* Testimonials and Patient Feedback form */}
        <Testimonials />
      </main>

      {/* Footer block */}
      <Footer
        onOpenPolicy={handleOpenPolicy}
        onScrollToSection={handleScrollToSection}
      />

      {/* ========================================================
         FLOATING ACTIONS LAYER (WhatsApp & Back to Top)
         ======================================================== */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        
        {/* Back to Top Trigger */}
        {showBackToTop && (
          <button
            id="back-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3.5 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 transition active:scale-95 shadow-lg shadow-slate-900/10 cursor-pointer border border-slate-800"
            title="Scroll to Top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}

        {/* Floating WhatsApp Action Button */}
        <a
          id="floating-whatsapp-btn"
          href="https://wa.me/919415080016?text=Hello%20Doctor%2C%20I%20would%20like%20to%20book%20an%20appointment%20at%20Priyanka%20Eye%20Care."
          target="_blank"
          rel="noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 border border-emerald-400 group relative"
          title="Chat with Priyanka Eye Care on WhatsApp"
        >
          {/* Pulse ring indicator */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping group-hover:hidden" />
          
          <MessageCircle className="h-7 w-7 relative z-10" />
        </a>

      </div>

      {/* ========================================================
         ADMIN CONTROL PANEL MODAL
         ======================================================== */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAppointmentsChanged={fetchUnreadBadge}
      />

      {/* ========================================================
         LEGAL POLICIES VIEWPORT MODALS
         ======================================================= */}
      <LegalModal
        isOpen={legalPolicyType !== null}
        onClose={() => setLegalPolicyType(null)}
        type={legalPolicyType}
      />

    </div>
  );
}
