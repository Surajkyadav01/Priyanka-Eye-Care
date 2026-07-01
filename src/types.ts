/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  doctor: string;
  date: string;
  time: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  isRead: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  experience: string;
  image: string;
  availableDays: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}
