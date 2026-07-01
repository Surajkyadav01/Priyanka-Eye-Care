/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Doctor, Service, Review, FAQ } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: 'doc_abhishek',
    name: 'Dr. Abhishek Maurya',
    qualification: 'MS Ophthalmology',
    specialization: 'Eye Sight Specialist & Micro Eye Surgeon',
    experience: '11+ Years of Clinical Experience',
    image: 'https://www.image2url.com/r2/default/images/1782884245357-09ff5a72-aa3c-4bc5-9ec5-4b0f4da84e2b.png',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  {
    id: 'doc_priyanka',
    name: 'Dr. Priyanka Maurya',
    qualification: 'BAMS',
    specialization: 'General Eye Care & Ayurvedic Vision Therapeutics',
    experience: '8+ Years of Medical Experience',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=600',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
];

export const SERVICES: Service[] = [
  {
    id: 'srv_checkup',
    title: 'Comprehensive Eye Checkup',
    description: 'A detailed examination using advanced computerized diagnostics to evaluate vision, refraction, and overall ocular health.',
    icon: 'Eye'
  },
  {
    id: 'srv_computer_vision',
    title: 'Computer Vision Test',
    description: 'Specialized diagnostic tests targeting digital eye strain, blue light exposure effects, and customized lens prescriptions.',
    icon: 'Monitor'
  },
  {
    id: 'srv_retina',
    title: 'Retina Examination',
    description: 'Detailed dilated eye examination to evaluate the central retina, macula, optic nerve, and blood vessels for systematic safety.',
    icon: 'Activity'
  },
  {
    id: 'srv_contact_lens',
    title: 'Contact Lens Prescription',
    description: 'Comprehensive corneal measurements, fitting consultations, and guidance for soft, rigid gas permeable, and cosmetic lenses.',
    icon: 'Sparkles'
  },
  {
    id: 'srv_spectacles',
    title: 'Premium Spectacles prescribing',
    description: 'Precise automated focal calculations and modern frame fitting to suit your cosmetic preferences and vocational needs.',
    icon: 'Glasses'
  },
  {
    id: 'srv_pediatric',
    title: 'Children Eye Care',
    description: 'Gentle, specialized pediatric eye examinations targeting squint detection, lazy eye (amblyopia), and early corrective lenses.',
    icon: 'Smile'
  },
  {
    id: 'srv_cataract',
    title: 'Cataract Consultation',
    description: 'Computerized evaluation of crystalline lens opacity, offering premium intraocular lens (IOL) counseling and surgical planning.',
    icon: 'ShieldAlert'
  },
  {
    id: 'srv_glaucoma',
    title: 'Glaucoma Diagnostics',
    description: 'Ocular pressure monitoring, visual field tracing, and early screening for silent optic nerve damage (the sneak thief of sight).',
    icon: 'HeartPulse'
  },
  {
    id: 'srv_squint',
    title: 'Squint Treatment',
    description: 'Comprehensive assessment of extraocular muscle imbalances, offering customized muscle strengthening exercises and surgery.',
    icon: 'RefreshCw'
  },
  {
    id: 'srv_lasik',
    title: 'LASIK Consultation',
    description: 'Advanced corneal topography and thickness profiling to determine eligibility for permanent freedom from spectacles.',
    icon: 'Zap'
  },
  {
    id: 'srv_cornea',
    title: 'Cornea Checkup',
    description: 'Diagnosing and treating corneal conditions such as dry eyes, infections, keratitis, pterygium, and corneal dystrophies.',
    icon: 'Circle'
  },
  {
    id: 'srv_micro_surgery',
    title: 'Micro Eye Surgery',
    description: 'State-of-the-art microscopic surgical treatments for delicate ocular tissues under sterile, highly controlled surgical settings.',
    icon: 'Scissors'
  },
  {
    id: 'srv_general_care',
    title: 'General Eye Care',
    description: 'Comprehensive solutions for seasonal conjunctivitis, allergic itching, foreign body removals, and routine visual maintenance.',
    icon: 'Heart'
  },
  {
    id: 'srv_emergency',
    title: 'Emergency Consultation',
    description: 'Round-the-clock priority evaluations for ocular trauma, chemical splashes, sudden loss of vision, or acute ocular pain.',
    icon: 'AlertTriangle'
  }
];

export const GALLERY_IMAGES = [
  {
    id: 'gal_real_1',
    title: 'Advanced Refraction Chamber & Diagnostics',
    category: 'Diagnostics',
    url: 'https://www.image2url.com/r2/default/images/1782886989110-ec37825e-7598-4d39-bc1a-ea4813924018.png'
  },
  {
    id: 'gal_real_2',
    title: 'Computerized Eye Testing & Consultation Suite',
    category: 'Technology',
    url: 'https://www.image2url.com/r2/default/images/1782887056576-6d356148-133f-433d-b6f1-89d8453f30cd.png'
  },
  {
    id: 'gal_real_3',
    title: 'Computerized Eye Testing Setup',
    category: 'Technology',
    url: 'https://www.image2url.com/r2/default/images/1782887087767-6fa50805-1f62-4280-9526-74021ab7f45b.png'
  },
  {
    id: 'gal_real_4',
    title: 'Premium Eyewear Collection & Frames Gallery',
    category: 'Optical',
    url: 'https://www.image2url.com/r2/default/images/1782887141557-d55c6574-bd7d-4339-8db6-a72ab3df7705.png'
  },
  {
    id: 'gal_real_5',
    title: 'Slit Lamp Biomicroscope Examination Unit',
    category: 'Diagnostics',
    url: 'https://www.image2url.com/r2/default/images/1782887396609-3fd470bd-0818-445e-af1a-208b57d1a114.png'
  },
  {
    id: 'gal_1',
    title: 'Modern Clinic Outer Frontage',
    category: 'Facility',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gal_2',
    title: 'Advanced Diagnostic Computerized Vision Suite',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gal_3',
    title: 'Opthalmic Slit Lamp Assessment',
    category: 'Diagnostics',
    url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gal_4',
    title: 'Computerized Refraction Eye Diagnostics',
    category: 'Diagnostics',
    url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gal_5',
    title: 'Premium Optical Spectacles Gallery',
    category: 'Optical',
    url: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'gal_6',
    title: 'Sterilized Micro Eye Surgery Theatre',
    category: 'Surgical',
    url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev_1',
    name: 'Suraj Yadav',
    rating: 5,
    comment: 'Priyanka Eye Care is the most professional clinic in Suriyawan. Dr. Abhishek Maurya analyzed my vision so carefully and prescribed computer glasses. My eye strain has completely gone!',
    date: '10 days ago',
    verified: true
  },
  {
    id: 'rev_2',
    name: 'Ramesh Chandra Bind',
    rating: 5,
    comment: 'Highly recommended for cataract consultation. The doctors are highly experienced, explain everything gently, and the treatment is extremely affordable compared to Varanasi or Prayagraj.',
    date: '3 weeks ago',
    verified: true
  },
  {
    id: 'rev_3',
    name: 'Sunita Mishra',
    rating: 5,
    comment: 'Excellent children eye care! My daughter was squinting while reading, but Dr. Priyanka Maurya evaluated her so patiently. She loves her new spectacles. Beautiful and clean hospital.',
    date: '1 month ago',
    verified: true
  },
  {
    id: 'rev_4',
    name: 'Anand Kumar Maurya',
    rating: 5,
    comment: 'Best computer eye testing facility in Bhadohi district. Clean environments, friendly staff, and the diagnosis is precise. They have the latest modern diagnostic instruments.',
    date: '2 months ago',
    verified: true
  }
];

export const FAQS: FAQ[] = [
  {
    id: 'faq_1',
    question: 'What are the opening hours of Priyanka Eye Care?',
    answer: 'Priyanka Eye Care is open daily from 9:00 AM to 8:00 PM. We are available for emergency consultations as well. Please feel free to schedule an appointment online or call us directly.'
  },
  {
    id: 'faq_2',
    question: 'How often should I get my eyes checked?',
    answer: 'For adults with good vision, an eye checkup every 1 to 2 years is recommended. If you have diabetes, blood pressure, high spectacles power, or are above 40 years old, an annual checkup is highly essential to prevent silent vision damage.'
  },
  {
    id: 'faq_3',
    question: 'What is a Computer Vision Test and do I need it?',
    answer: 'If you spend more than 3-4 hours daily on laptops, smartphones, or televisions, and experience headaches, dry eyes, or blurred vision, a Computer Vision Test is critical. It evaluates digital eye strain and prescribes specialized anti-glare/blue-cut lenses.'
  },
  {
    id: 'faq_4',
    question: 'Are cataract surgeries handled at Priyanka Eye Care?',
    answer: 'Yes, we provide state-of-the-art computerized Cataract Consultations, premium intraocular lens (IOL) measurements, and advanced Micro Eye Surgery consultations under experienced surgeon Dr. Abhishek Maurya.'
  },
  {
    id: 'faq_5',
    question: 'How can I reach Priyanka Eye Care in Suriyawan?',
    answer: 'We are situated at Suriyawan, Bhadohi (221404), near Bypass Chauraha on Durgaganj Road. You can find us easily on Google Maps. There is ample parking space available.'
  }
];
