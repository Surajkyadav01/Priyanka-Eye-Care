/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Bell, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  unreadCount: number;
  onOpenAdmin: () => void;
  onScrollToSection: (sectionId: string) => void;
  activeSection: string;
}

export default function Navbar({ unreadCount, onOpenAdmin, onScrollToSection, activeSection }: NavbarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Services', id: 'services' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Appointment', id: 'appointment' },
    { label: 'Contact', id: 'contact' },
    { label: 'Feedback', id: 'feedback' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(id);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        id="main-navbar"
        className={`w-full z-40 transition-all duration-300 ${
          isSticky
            ? 'sticky top-0 bg-slate-50/95 backdrop-blur-md shadow-md py-2 border-b border-slate-200'
            : 'relative bg-slate-50 py-3 border-b border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">
          
          {/* Brand Logo with exact URL provided */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="flex items-center gap-2 group"
          >
            <div className="relative h-14 w-auto min-w-[130px] max-w-[220px] flex items-center justify-center overflow-hidden py-0.5">
              <img
                src="https://www.image2url.com/r2/default/images/1782880574840-02cdda6c-38b5-403e-9c3a-bb74b89fe697.png"
                alt="Priyanka Eye Care Logo"
                className="h-full w-auto object-contain transition-transform group-hover:scale-[1.03]"
                onError={(e) => {
                  // Fallback in case of network issues with image URL hosting
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('span');
                    fallback.className = 'text-blue-900 font-display font-extrabold text-lg';
                    fallback.innerText = 'Priyanka Eye Care';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`text-sm font-semibold transition-colors py-1 relative ${
                  activeSection === item.id
                    ? 'text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Admin Portal Indicator */}
            <button
              id="admin-bell-button"
              onClick={onOpenAdmin}
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition"
              title="Administrator Dashboard"
            >
              <Bell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Call button */}
            <a
              href="tel:+919415080016"
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Phone className="h-4 w-4 text-blue-600" />
              <span>Call Now</span>
            </a>

            {/* Primary CTA Book button */}
            <button
              id="header-cta-book"
              onClick={() => handleNavClick('appointment')}
              className="ripple bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 active:scale-95 transition-all cursor-pointer"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Actions Toolbar */}
          <div className="flex items-center gap-1 lg:hidden">
            {/* Bell icon on mobile */}
            <button
              id="admin-bell-mobile"
              onClick={onOpenAdmin}
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Call button on mobile */}
            <a
              href="tel:+919415080016"
              className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition"
              title="Call Priyanka Eye Care"
            >
              <Phone className="h-5 w-5" />
            </a>

            {/* Menu Trigger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl p-6 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="font-display font-extrabold text-lg text-blue-900">Navigation</span>
                  <button
                    id="close-mobile-menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item.id);
                      }}
                      className={`text-base font-semibold py-1.5 px-3 rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <a
                  href="https://wa.me/919415080016?text=Hello%20Doctor%2C%20I%20would%20like%20to%20book%20an%20appointment%20at%20Priyanka%20Eye%20Care."
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp Chat</span>
                </a>
                
                <button
                  id="mobile-drawer-book-btn"
                  onClick={() => handleNavClick('appointment')}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                  Book Appointment
                </button>

                <button
                  id="mobile-drawer-admin-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Admin Dashboard
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
