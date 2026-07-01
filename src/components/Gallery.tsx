/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { GALLERY_IMAGES } from '../data';
import { motion, AnimatePresence } from 'motion/react';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter images by tag
  const categories = ['All', 'Facility', 'Technology', 'Diagnostics', 'Optical', 'Surgical'];
  const filteredImages = selectedCategory === 'All'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(img => img.category === selectedCategory);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <section id="gallery" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Clinic Gallery
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Facility & Clinical Infrastructure
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed font-sans">
            Explore Priyanka Eye Care’s hygienic treatment chambers, advanced diagnostics setups, and welcoming optical gallery spaces.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border transition-all active:scale-95 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-500/15'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, index) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg cursor-zoom-in transition-all duration-300"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to beautiful icon if image URL fails
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex flex-col items-center justify-center bg-blue-50 text-blue-500 gap-2';
                      fallback.innerHTML = `
                        <svg class="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="text-xs font-bold text-slate-500">${img.title}</span>
                      `;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>

              {/* Info Overlay */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {img.category}
                    </span>
                    <h4 className="font-display text-sm font-bold text-white tracking-wide">
                      {img.title}
                    </h4>
                  </div>
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-700">No images inside category {selectedCategory}</p>
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 select-none"
              onClick={() => setLightboxIndex(null)}
            >
              {/* Close Button */}
              <button
                id="close-lightbox"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Prev control */}
              <button
                id="prev-lightbox-image"
                onClick={handlePrev}
                className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>

              {/* Main Image View */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredImages[lightboxIndex].url}
                  alt={filteredImages[lightboxIndex].title}
                  className="w-full h-auto max-h-[75vh] object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {/* Description bar */}
                <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      {filteredImages[lightboxIndex].category}
                    </span>
                    <h3 className="font-display text-base font-bold text-white">
                      {filteredImages[lightboxIndex].title}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    Image {lightboxIndex + 1} of {filteredImages.length}
                  </div>
                </div>
              </motion.div>

              {/* Next control */}
              <button
                id="next-lightbox-image"
                onClick={handleNext}
                className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
