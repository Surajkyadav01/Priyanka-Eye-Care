/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Appointment } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser
app.use(express.json());

// Path to data store
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'appointments.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Admin Password setting (fallback to robust default if not specified)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'PriyankaEyeCare@Admin';

// Helper to read appointments
function getAppointments(): Appointment[] {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as Appointment[];
  } catch (err) {
    console.error('Error reading appointments file:', err);
    return [];
  }
}

// Helper to write appointments
function saveAppointments(appointments: Appointment[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing appointments file:', err);
    return false;
  }
}

// Professional HTML Mail Notification Handler
async function sendAppointmentEmail(appointment: Appointment) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #eff6ff; padding-bottom: 16px;">
        <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">Priyanka Eye Care</h2>
        <p style="color: #3b82f6; font-size: 14px; margin: 6px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">New Appointment Request</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
        <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; font-size: 16px;">Patient Demographics & Request</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px; font-size: 14px;">Full Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px;">${appointment.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Phone Number:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">
              <a href="tel:${appointment.phone}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">${appointment.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Email Address:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${appointment.email || '<span style="color: #94a3b8; font-style: italic;">Not provided</span>'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Required Service:</td>
            <td style="padding: 8px 0; color: #2563eb; font-weight: bold; font-size: 14px;">${appointment.service}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Preferred Doctor:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 14px;">${appointment.doctor}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Date & Time:</td>
            <td style="padding: 8px 0; color: #10b981; font-weight: bold; font-size: 14px;">${appointment.date} at ${appointment.time}</td>
          </tr>
        </table>
      </div>
      
      ${appointment.message ? `
      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; color: #475569; font-size: 14px;">Patient Notes:</h4>
        <div style="margin: 0; padding: 14px; background-color: #fafafa; border-left: 4px solid #3b82f6; border-radius: 4px; color: #334155; font-style: italic; font-size: 14px; line-height: 1.5;">
          "${appointment.message}"
        </div>
      </div>` : ''}

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/?admin=true" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: 600; border-radius: 6px; text-decoration: none; font-size: 14px; transition: background-color 0.2s;">
          Open Admin Dashboard
        </a>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.4;">
        <p style="margin: 0;">This notification was dispatched automatically from Priyanka Eye Care web server.</p>
        <p style="margin: 4px 0 0 0; font-weight: 500;">Location: Suriyawan, Bhadohi (221404) | Near Bypass Chauraha, Durgaganj Road</p>
      </div>
    </div>
  `;

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"Priyanka Eye Care Web Portal" <${user}>`,
        to: 'ksurajyadav93@gmail.com',
        subject: `🔔 New Appointment Requested: ${appointment.name}`,
        html: emailTemplate
      });
      console.log(`[SMTP Email] Sent appointment notification to ksurajyadav93@gmail.com`);
    } catch (err) {
      console.error('[SMTP Email Error] NodeMailer failed to transmit:', err);
    }
  } else {
    console.log(`[Mock Email Triggered] Recipients: ksurajyadav93@gmail.com\nSubject: New Appointment Requested\nHTML Content:`, emailTemplate);
  }
}

/* ========================================================
   API ROUTES
   ======================================================== */

// Secure Public Unread Badge Counter (No HIPAA data leaked)
app.get('/api/appointments/unread-badge', (req, res) => {
  try {
    const appointments = getAppointments();
    const unreadCount = appointments.filter(apt => !apt.isRead).length;
    return res.json({ unreadCount });
  } catch (err) {
    return res.json({ unreadCount: 0 });
  }
});

// Admin Password Login Validation
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: 'validated_admin_session_key' });
  } else {
    return res.status(401).json({ error: 'Incorrect password. Access denied.' });
  }
});

// Book Appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, phone, email, service, doctor, date, time, message } = req.body;
    if (!name || !phone || !service || !doctor || !date || !time) {
      return res.status(400).json({ error: 'Please fulfill all required appointment fields' });
    }

    const appointments = getAppointments();
    const newAppointment: Appointment = {
      id: 'apt_' + Math.random().toString(36).substr(2, 9),
      name,
      phone,
      email: email || '',
      service,
      doctor,
      date,
      time,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    appointments.unshift(newAppointment); // Add to beginning
    const success = saveAppointments(appointments);

    if (!success) {
      return res.status(500).json({ error: 'Failed to record appointment in database' });
    }

    // Trigger Email Notification in the background safely
    sendAppointmentEmail(newAppointment).catch(err => {
      console.error('Email error:', err);
    });

    return res.status(201).json({ success: true, appointment: newAppointment });
  } catch (error) {
    console.error('Error handling book appointment route:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch All Appointments (Protected by x-admin-password)
app.get('/api/appointments', (req, res) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const appointments = getAppointments();
  return res.json({ appointments });
});

// Update Appointment Status (Protected)
app.post('/api/appointments/:id/status', (req, res) => {
  const password = req.headers['x-admin-password'] || req.body.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid appointment status' });
  }

  const appointments = getAppointments();
  const appointmentIndex = appointments.findIndex(apt => apt.id === id);

  if (appointmentIndex === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  appointments[appointmentIndex].status = status;
  appointments[appointmentIndex].isRead = true; // Set read once acted on

  const success = saveAppointments(appointments);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update database record' });
  }

  return res.json({ success: true, appointment: appointments[appointmentIndex] });
});

// Mark Notification as Read
app.post('/api/appointments/mark-read', (req, res) => {
  const password = req.headers['x-admin-password'] || req.body.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appointments = getAppointments();
  const updated = appointments.map(apt => ({ ...apt, isRead: true }));
  saveAppointments(updated);

  return res.json({ success: true });
});

// Delete Appointment (Protected)
app.delete('/api/appointments/:id', (req, res) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const { id } = req.params;
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(apt => apt.id !== id);

  if (appointments.length === filteredAppointments.length) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const success = saveAppointments(filteredAppointments);
  if (!success) {
    return res.status(500).json({ error: 'Failed to write updates to database' });
  }

  return res.json({ success: true, message: 'Appointment successfully deleted' });
});

// Live Admin Stats (Protected)
app.get('/api/admin/stats', (req, res) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appointments = getAppointments();
  const unreadCount = appointments.filter(apt => !apt.isRead).length;
  const total = appointments.length;
  const pending = appointments.filter(apt => apt.status === 'pending').length;
  const accepted = appointments.filter(apt => apt.status === 'accepted').length;

  return res.json({
    unreadCount,
    total,
    pending,
    accepted
  });
});

/* ========================================================
   VITE DEVELOPER MIDDLEWARE / STATIC SITE HOSTING
   ======================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================================`);
    console.log(` Priyanka Eye Care Web Server Running Successfully`);
    console.log(` Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` API endpoints prefix: http://localhost:${PORT}/api`);
    console.log(` Admin Dashboard Password configured: "${ADMIN_PASSWORD}"`);
    console.log(`========================================================`);
  });
}

startServer().catch(err => {
  console.error('Critical failure starting Priyanka Eye Care Server:', err);
});
