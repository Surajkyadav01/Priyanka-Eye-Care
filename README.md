# 👁️ Priyanka Eye Care - Premium Full-Stack Web Portal

A high-performance, responsive, and beautifully designed full-stack web application developed for **Priyanka Eye Care** (located in Suriyawan, Bhadohi). This portal delivers an elegant user interface for patients while offering a robust, password-protected Admin Dashboard for clinic operations.

---

## 🚀 Key Features

### 💻 Client-Facing Experience
* **Professional Landing Page:** High-impact modern layout designed with Inter and custom display typography.
* **Responsive Gallery:** High-resolution interactive gallery displaying actual clinic facilities, consultation suites, and diagnostics setup, optimizing layouts for both mobile devices and desktops.
* **Smart Appointment Scheduler:** Frictionless appointment booking form with instant validation, preferred doctor selector, and specialized services selector.
* **Testimonials System:** Interactive patient reviews section with client-side persistence and verified patient badges.
* **Interactive FAQs:** Elegant collapsible accordion component answering common patient questions about eye care, procedures, and appointments.

### 🛡️ Admin Dashboard (`/?admin=true`)
* **Real-Time Analytics:** Visual stats indicating Total Appointments, Pending requests, and Accepted bookings.
* **Appointment Manager:** View patient demographics (Name, Phone, Email, Service, Preferred Doctor, Date, Time, and customized message).
* **Actionable Workflows:** Easily update status (Accept / Reject), mark notifications as read, or delete resolved entries.
* **Password Protection:** Secure dashboard access guarded by a custom admin session verification system.

### 📧 SMTP Email Notifications
* **Automated Dispatch:** When a patient schedules an appointment, an instantaneous, professionally-styled HTML email notification is sent directly to the clinic manager (`ksurajyadav93@gmail.com`).
* **Interactive Direct Link:** The generated email contains a button allowing the administrator to open the dashboard with a single click.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS (v4), Lucide Icons, Framer Motion
* **Backend:** Node.js, Express.js (Single-bundle compiled with Esbuild)
* **Email System:** Nodemailer (SMTP Relay Integration)
* **Data Storage:** High-reliability filesystem JSON database (`/data/appointments.json`)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
# Admin Panel Security
ADMIN_PASSWORD=PriyankaEyeCare@Admin

# Web Server Application URL (for email redirect links)
APP_URL=http://localhost:3000

# SMTP Mail Server Settings (Nodemailer configuration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

---

## 📦 Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes packaged with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/priyanka-eye-care.git
cd priyanka-eye-care
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Mode
Runs the backend Express server and mounts the Vite middleware on port `3000`.
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
This compiles the client-side SPA static assets into the `/dist` folder, and bundles the Express `server.ts` into a self-contained single file `/dist/server.cjs` via `esbuild`.
```bash
npm run build
```

### 5. Start Production Server
Launches the standalone optimized application.
```bash
npm start
```

---

## 📬 SMTP Email Setup Guide

To enable email notifications when appointments are booked:

1. **Host Configuration:** If using Gmail, set `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`.
2. **SMTP User:** Enter your full Gmail address in `SMTP_USER`.
3. **SMTP Pass:** Do **not** use your account password. Instead:
   * Go to your Google Account Settings -> Security.
   * Enable **2-Step Verification**.
   * Under 2-Step Verification, select **App passwords**.
   * Generate an App password (e.g., named "Clinic Website") and paste the 16-character code into `SMTP_PASS`.
4. Once these details are applied, every booking will trigger a direct email notification!

---

## 📱 Mobile-First Design & Speed
The application is strictly audited to ensure:
* **Perfect Responsive Breaks:** Fluid and clean viewing across all mobile models (iPhone, Android, Tablets).
* **Speed Optimized:** Low latency loads due to compiled backend packaging and lightweight client assets.
* **No Cache Lag:** Employs optimal rendering cycles and optimized image presentation.
