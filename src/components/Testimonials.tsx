/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, MessageSquare, BadgeCheck, Send, User } from 'lucide-react';
import { REVIEWS } from '../data';
import { Review } from '../types';

export default function Testimonials() {
  const [reviewsList, setReviewsList] = useState<Review[]>(() => {
    const saved = localStorage.getItem('priyanka_eye_care_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return REVIEWS;
  });
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);

    if (!newReview.name || !newReview.comment) {
      alert('Please enter your name and comments before submitting feedback.');
      return;
    }

    const created: Review = {
      id: 'rev_' + Math.random().toString(36).substr(2, 9),
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: 'Just now',
      verified: false
    };

    const updated = [created, ...reviewsList];
    setReviewsList(updated);
    localStorage.setItem('priyanka_eye_care_reviews', JSON.stringify(updated));
    setSubmitted(true);
    
    // Reset form
    setNewReview({ name: '', rating: 0, comment: '' });
    
    // Reset success banner after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <section id="feedback" className="py-20 bg-white border-b border-slate-200 scroll-mt-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            Patient Feedback
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Patients Say About Priyanka Eye Care
          </h2>
          <div className="h-1.5 w-16 bg-blue-700 mx-auto rounded-full" />
          <p className="text-slate-600 leading-relaxed">
            Patient therapeutic comfort is our pride. Read the verified reviews left by Suriyawan community members, or share your own experience.
          </p>
        </div>

        {/* Content Splitting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: List of patient testimonials */}
          <div className="lg:col-span-7 space-y-5">
            <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-700" />
              <span>Patient Testimonials ({reviewsList.length})</span>
            </h3>

            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    
                    {/* User identifier */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-display font-bold text-xs sm:text-sm text-slate-800">{rev.name}</span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                            <BadgeCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono block">{rev.date}</span>
                    </div>

                    {/* Score Stars */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed italic mt-2.5 sm:mt-4">
                    "{rev.comment}"
                  </p>

                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Leave a Feedback form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
              Share Your Valuable Experience
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Patient Name */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-name-input" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Your Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  id="feedback-name-input"
                  required
                  placeholder="Enter full name..."
                  value={newReview.name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* Star Rating Selectors */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700 block">Overall Clinical Rating <span className="text-rose-500">*</span></span>
                  {ratingError && (
                    <span className="text-[10px] font-bold text-rose-500 animate-pulse">Please select a star rating</span>
                  )}
                </div>
                <div className="flex gap-1.5 pt-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const ratingValue = idx + 1;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setRatingError(false);
                          setNewReview(prev => ({ ...prev, rating: ratingValue }));
                        }}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 hover:scale-110 active:scale-95 transition cursor-pointer"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            ratingValue <= (hoverRating ?? newReview.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comments Text */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-comments-textarea" className="text-xs font-semibold text-slate-700">Detailed Feedback <span className="text-rose-500">*</span></label>
                <textarea
                  id="feedback-comments-textarea"
                  required
                  rows={4}
                  placeholder="Share details of eye comfort, treatment quality, doctor's guidelines, clinic hygiene..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 bg-slate-50 focus:bg-white transition-all"
                />
              </div>

              {/* Success notice */}
              {submitted && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl leading-relaxed">
                  ✓ Success! Your feedback has been published below under Patient Testimonials. Thank you for supporting Priyanka Eye Care.
                </div>
              )}

              {/* Submit btn */}
              <button
                type="submit"
                className="ripple w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 py-3.5 text-sm font-bold text-white transition shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Publish Feedback Review</span>
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
