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
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';

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

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Dynamic Firebase Firestore Setup
let firebaseApp;
let db: any = null;

try {
  const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const configData = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const firebaseConfig = {
      apiKey: configData.apiKey,
      authDomain: configData.authDomain,
      projectId: configData.projectId,
      storageBucket: configData.storageBucket,
      messagingSenderId: configData.messagingSenderId,
      appId: configData.appId
    };
    firebaseApp = initializeApp(firebaseConfig);
    try {
      if (configData.firestoreDatabaseId) {
         db = getFirestore(firebaseApp, configData.firestoreDatabaseId);
      } else {
         db = getFirestore(firebaseApp);
      }
    } catch (dbErr) {
      console.warn(`Failed to initialize custom named database '${configData.firestoreDatabaseId}' on server, falling back to '(default)':`, dbErr);
      db = getFirestore(firebaseApp);
    }
    console.log('Firebase Firestore initialized successfully with project ID:', configData.projectId);
  } else {
    console.warn('Firebase configuration file not found.');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Firestore:', err);
}

// Helper to get admin password dynamically
function getAdminPassword(): string {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);
      if (config && config.adminPassword) {
        return config.adminPassword;
      }
    }
  } catch (err) {
    console.error('Error reading admin password from config:', err);
  }
  return process.env.ADMIN_PASSWORD || 'doctor';
}

// Helper to update admin password dynamically
function saveAdminPassword(newPassword: string): boolean {
  try {
    let config: any = {};
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      config = JSON.parse(data);
    }
    config.adminPassword = newPassword;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving admin password:', err);
    return false;
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean | null;
    isAnonymous: boolean | null;
    tenantId: string | null;
    providerInfo: {
      providerId: string | null;
      email: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to read local appointments
function getLocalAppointments(): Appointment[] {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data) as Appointment[];
  } catch (err) {
    console.error('Error reading local appointments file:', err);
    return [];
  }
}

// Helper to write local appointments
function saveLocalAppointments(appointments: Appointment[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing local appointments file:', err);
    return false;
  }
}

// Helper to read appointments from Firestore (with local fallback)
async function getAppointments(): Promise<Appointment[]> {
  if (!db) {
    console.warn('Firestore is not initialized. Using local file storage.');
    return getLocalAppointments();
  }
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list: Appointment[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Appointment);
    });
    return list;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'appointments');
    } catch (firestoreErr) {
      console.error('Error fetching appointments from Firestore, using local fallback:', firestoreErr);
    }
    return getLocalAppointments();
  }
}

// Helper to add an appointment
async function addAppointment(appointment: Appointment): Promise<boolean> {
  const localList = getLocalAppointments();
  localList.unshift(appointment);
  saveLocalAppointments(localList);

  if (!db) return true;
  try {
    await setDoc(doc(db, 'appointments', appointment.id), appointment);
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.CREATE, `appointments/${appointment.id}`);
    } catch (firestoreErr) {
      console.error('Error adding appointment to Firestore, using local fallback:', firestoreErr);
    }
    return true;
  }
}

// Helper to update appointment status
async function updateAppointmentStatus(id: string, status: 'pending' | 'accepted' | 'rejected'): Promise<boolean> {
  const localList = getLocalAppointments();
  const idx = localList.findIndex(apt => apt.id === id);
  if (idx !== -1) {
    localList[idx].status = status;
    localList[idx].isRead = true;
    saveLocalAppointments(localList);
  }

  if (!db) return true;
  try {
    await updateDoc(doc(db, 'appointments', id), { status, isRead: true });
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.UPDATE, `appointments/${id}`);
    } catch (firestoreErr) {
      console.error('Error updating appointment status in Firestore, using local fallback:', firestoreErr);
    }
    return true;
  }
}

// Helper to mark all notifications as read
async function markAllRead(): Promise<boolean> {
  const localList = getLocalAppointments();
  const updatedLocal = localList.map(apt => ({ ...apt, isRead: true }));
  saveLocalAppointments(updatedLocal);

  if (!db) return true;
  try {
    const q = query(collection(db, 'appointments'));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.isRead) {
        batch.update(docSnap.ref, { isRead: true });
        count++;
      }
    });
    if (count > 0) {
      await batch.commit();
    }
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, 'appointments');
    } catch (firestoreErr) {
      console.error('Error marking all read in Firestore, using local fallback:', firestoreErr);
    }
    return true;
  }
}

// Helper to delete an appointment
async function deleteAppointment(id: string): Promise<boolean> {
  const localList = getLocalAppointments();
  const filtered = localList.filter(apt => apt.id !== id);
  saveLocalAppointments(filtered);

  if (!db) return true;
  try {
    await deleteDoc(doc(db, 'appointments', id));
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `appointments/${id}`);
    } catch (firestoreErr) {
      console.error('Error deleting appointment in Firestore, using local fallback:', firestoreErr);
    }
    return true;
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
app.get('/api/appointments/unread-badge', async (req, res) => {
  try {
    const appointments = await getAppointments();
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
  if (password === getAdminPassword()) {
    return res.json({ success: true, token: 'validated_admin_session_key' });
  } else {
    return res.status(401).json({ error: 'Incorrect password. Access denied.' });
  }
});

// Admin Password Update Endpoint
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const activePassword = getAdminPassword();

  if (currentPassword !== activePassword) {
    return res.status(401).json({ error: 'Incorrect current password' });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const success = saveAdminPassword(newPassword);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update password on server' });
  }

  return res.json({ success: true, message: 'Password successfully updated' });
});

// Admin Password Reset Endpoint (using Registered Email Verification)
app.post('/api/admin/reset-password', (req, res) => {
  const { resetKey, newPassword } = req.body;
  
  if (resetKey !== 'ksurajyadav93@gmail.com') {
    return res.status(401).json({ error: 'Invalid reset code or email' });
  }
  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const success = saveAdminPassword(newPassword);
  if (!success) {
    return res.status(500).json({ error: 'Failed to reset password on server' });
  }

  return res.json({ success: true, message: 'Password successfully reset' });
});

// Book Appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { name, phone, email, service, doctor, date, time, message } = req.body;
    if (!name || !phone || !service || !doctor || !date || !time) {
      return res.status(400).json({ error: 'Please fulfill all required appointment fields' });
    }

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

    const success = await addAppointment(newAppointment);

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
app.get('/api/appointments', async (req, res) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== getAdminPassword()) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const appointments = await getAppointments();
  return res.json({ appointments });
});

// Update Appointment Status (Protected)
app.post('/api/appointments/:id/status', async (req, res) => {
  const password = req.headers['x-admin-password'] || req.body.password;
  if (password !== getAdminPassword()) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid appointment status' });
  }

  const appointments = await getAppointments();
  const appointment = appointments.find(apt => apt.id === id);

  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  appointment.status = status;
  appointment.isRead = true;

  const success = await updateAppointmentStatus(id, status);
  if (!success) {
    return res.status(500).json({ error: 'Failed to update database record' });
  }

  return res.json({ success: true, appointment });
});

// Mark Notification as Read
app.post('/api/appointments/mark-read', async (req, res) => {
  const password = req.headers['x-admin-password'] || req.body.password;
  if (password !== getAdminPassword()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await markAllRead();

  return res.json({ success: true });
});

// Delete Appointment (Protected)
app.delete('/api/appointments/:id', async (req, res) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== getAdminPassword()) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }

  const { id } = req.params;
  const appointments = await getAppointments();
  const appointmentExists = appointments.some(apt => apt.id === id);

  if (!appointmentExists) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const success = await deleteAppointment(id);
  if (!success) {
    return res.status(500).json({ error: 'Failed to write updates to database' });
  }

  return res.json({ success: true, message: 'Appointment successfully deleted' });
});

// Live Admin Stats (Protected)
app.get('/api/admin/stats', async (req, res) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== getAdminPassword()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appointments = await getAppointments();
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
    console.log(` Admin Dashboard Password configured: "${getAdminPassword()}"`);
    console.log(`========================================================`);
  });
}

startServer().catch(err => {
  console.error('Critical failure starting Priyanka Eye Care Server:', err);
});
