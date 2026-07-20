# MedConsult — Book a Doctor 🩺

> A full-stack MERN telemedicine platform where patients can discover verified doctors, book appointments, and receive email + SMS notifications — all under a single unified system with three distinct role-based dashboards.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Seeding the Admin Account](#seeding-the-admin-account)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Role-Based Access](#-role-based-access)

---

## 🏥 Project Overview

**MedConsult** is a comprehensive telemedicine booking platform that digitises the complete patient-to-doctor appointment lifecycle:

1. **Patients** register, search for verified specialists, and book time slots.
2. **Doctors** review appointment requests, approve/reject them, and mark consultations as completed.
3. **Admins** verify doctor credentials, manage all users, and monitor platform-wide statistics.

Every appointment state change triggers an automated **email alert** and a **console-logged SMS notification** to the relevant parties.

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **Express.js** | REST API server |
| **MongoDB** + **Mongoose** | Database + ODM |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **Nodemailer** | Email notification system |
| **Multer** | File uploads (profile photos, medical documents) |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-Origin Resource Sharing policy |
| **Morgan** | HTTP request logger |
| **express-async-errors** | Async error propagation |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **React Router DOM v6** | Client-side routing |
| **Material UI (MUI) v5** | Component library |
| **Axios** | HTTP client |
| **@react-oauth/google** | Google OAuth integration |
| **Day.js** | Date formatting |
| **Styled Components** | Supplementary styling |

---

## ✨ Features

### 👤 Patient
- **OTP-verified registration** (Gmail only, 6-digit code via email)
- **Google OAuth login** (one-click sign-in)
- **Doctor search** with filters: specialization, location, fees
- **Real-time slot selection** based on doctor's availability timings
- **Appointment booking** with duplicate prevention
- **Medical document upload** (PDF/image) per appointment
- **Appointment dashboard** with status tracking (pending → confirmed → completed)
- **Email + SMS notifications** on every appointment state change
- **Profile management** (name, phone, gender, DOB, blood group, allergies, medical history)
- **Profile photo upload**

### 🩺 Doctor
- **Pending-verification onboarding** — requires admin approval before access
- **Appointment review queue** — approve or reject patient requests
- **Visit summary & recommendations** entry on appointment completion
- **Availability schedule management** (days + time slots)
- **Doctor profile page** (bio, specialization, fees, location, experience)
- **Notifications** for new booking requests

### 🔐 Admin
- **Platform statistics dashboard** (total patients, doctors, appointments by status)
- **Doctor credential review queue** — approve or reject with optional note
- **User management** — activate or deactivate accounts (soft-delete)
- **Full appointment oversight** with filtering
- **All-doctor listing** with status filter

---

## 🏗 Architecture

```
┌─────────────────────────────────────────┐
│              React SPA (CRA)            │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Patient  │ │  Doctor  │ │  Admin  │ │
│  │Dashboard │ │Dashboard │ │Dashboard│ │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       └────────────┼─────────────┘      │
│              AuthContext                │
│    (JWT stored in localStorage)         │
│              Axios Client               │
│    (Bearer token interceptor)           │
└──────────────────┬──────────────────────┘
                   │ HTTPS REST API
┌──────────────────▼──────────────────────┐
│         Express.js Backend              │
│  ┌──────────────────────────────────┐   │
│  │  Routes → Middleware → Controllers│  │
│  │  requireAuth / requireAdmin      │   │
│  │  requireDoctor / requireUser     │   │
│  └────────────────┬─────────────────┘   │
│                   │                     │
│  ┌────────────────▼─────────────────┐   │
│  │         MongoDB (Atlas)          │   │
│  │  Users │ Doctors │ Appointments  │   │
│  │  Notifications │ OTPs            │   │
│  └──────────────────────────────────┘   │
│                                         │
│  Nodemailer → Gmail SMTP                │
│  Multer → /uploads (static files)       │
└─────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — either local (`mongodb://localhost:27017`) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- A **Gmail account** with an [App Password](https://myaccount.google.com/apppasswords) for SMTP
- A **Google Cloud Console** project with OAuth 2.0 credentials (for Google Sign-In)

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, SMTP credentials, etc.

# 4. Start the development server (with nodemon hot-reload)
npm run dev
```

The API will be available at: `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env
# Edit .env with your API base URL and Google Client ID

# 4. Start the development server
npm start
```

The app will open at: `http://localhost:3000`

---

### Seeding the Admin Account

After starting the backend, run the seed script to create the initial admin user:

```bash
cd backend
node seedAdmin.js
```

This creates an admin account with:
- **Email:** `admin@medconsult.com`
- **Password:** `Admin@123`

> ⚠️ **Important:** Change the admin password immediately after first login in production.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | Environment: `development` \| `production` \| `test` |
| `PORT` | ✅ | Server port (default: `5000`) |
| `MONGO_URI` | ✅ | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | ✅ | Strong random string (≥ 64 chars) for JWT signing |
| `JWT_EXPIRES_IN` | ✅ | Token TTL (e.g., `7d`, `24h`) |
| `CLIENT_ORIGIN` | ✅ | Allowed CORS origin(s), comma-separated |
| `UPLOAD_DIR` | ✅ | Upload folder name (default: `uploads`) |
| `MAX_FILE_SIZE_MB` | ✅ | Max upload size in MB (default: `5`) |
| `SMTP_HOST` | ✅ | SMTP server hostname (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | ✅ | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | ✅ | SMTP username / Gmail address |
| `SMTP_PASS` | ✅ | SMTP password or Gmail App Password |
| `GOOGLE_CLIENT_ID` | ⚪ | Google OAuth Client ID (for token verification) |
| `GOOGLE_CLIENT_SECRET` | ⚪ | Google OAuth Client Secret |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | ✅ | Backend API base URL (e.g., `http://localhost:5000/api/v1`) |
| `REACT_APP_GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID (same as backend) |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication (`/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register-intent` | Public | Request OTP to email |
| POST | `/auth/verify-otp` | Public | Verify 6-digit OTP |
| POST | `/auth/register/patient` | Public | Create patient account |
| POST | `/auth/register/doctor` | Public | Apply as doctor (pending review) |
| POST | `/auth/login` | Public | Email + password login → JWT |
| POST | `/auth/google` | Public | Google OAuth login → JWT |
| GET | `/auth/me` | 🔒 JWT | Get own profile |
| PUT | `/auth/profile` | 🔒 JWT | Update profile fields |
| PUT | `/auth/password` | 🔒 JWT | Change password |
| POST | `/auth/photo` | 🔒 JWT | Upload profile photo |

### Doctors (`/doctors`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/doctors` | Public | Search & filter doctors |
| GET | `/doctors/:id` | Public | Get single doctor profile |
| GET | `/doctors/me/profile` | 🔒 Doctor | Get own doctor profile |
| PUT | `/doctors/me/profile` | 🔒 Doctor | Update professional details |
| PUT | `/doctors/me/timings` | 🔒 Doctor | Update availability schedule |
| POST | `/doctors/me/photo` | 🔒 Doctor | Upload doctor profile photo |

### Appointments (`/appointments`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/appointments` | 🔒 Patient | Book an appointment |
| GET | `/appointments/my` | 🔒 Patient | Get patient's appointments |
| GET | `/appointments/my/stats` | 🔒 Patient | Get status counts |
| DELETE | `/appointments/:id/cancel` | 🔒 Patient | Cancel pending appointment |
| POST | `/appointments/:id/document` | 🔒 Patient | Upload medical document |
| GET | `/appointments/doctor` | 🔒 Doctor | Get doctor's appointments |
| PUT | `/appointments/:id/approve` | 🔒 Doctor | Approve appointment |
| PUT | `/appointments/:id/reject` | 🔒 Doctor | Reject appointment |
| PUT | `/appointments/:id/complete` | 🔒 Doctor | Mark as completed |

### Admin (`/admin`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | 🔒 Admin | Platform-wide statistics |
| GET | `/admin/users` | 🔒 Admin | List all users |
| PUT | `/admin/users/:id/deactivate` | 🔒 Admin | Deactivate user account |
| PUT | `/admin/users/:id/activate` | 🔒 Admin | Re-activate user account |
| GET | `/admin/doctors/pending` | 🔒 Admin | Doctor review queue |
| GET | `/admin/doctors` | 🔒 Admin | All doctor records |
| PUT | `/admin/doctors/:id/approve` | 🔒 Admin | Approve doctor application |
| PUT | `/admin/doctors/:id/reject` | 🔒 Admin | Reject doctor application |
| GET | `/admin/appointments` | 🔒 Admin | Full appointment ledger |

### Notifications (`/notifications`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | 🔒 JWT | Get own notifications |
| GET | `/notifications/unread-count` | 🔒 JWT | Get unread count |
| PUT | `/notifications/:id/read` | 🔒 JWT | Mark as read |
| PUT | `/notifications/read-all` | 🔒 JWT | Mark all as read |

---

## 📁 Project Structure

```
Book-a-Doctor/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── multer.js              # File upload configuration
│   ├── controllers/
│   │   ├── admin.controller.js    # Admin CRUD + doctor approval
│   │   ├── appointment.controller.js  # Full appointment lifecycle
│   │   ├── auth.controller.js     # Auth: register, login, OAuth
│   │   ├── doctor.controller.js   # Doctor profile management
│   │   └── notification.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT verification + RBAC guards
│   ├── models/
│   │   ├── User.js               # Core user schema (all roles)
│   │   ├── Doctor.js             # Doctor professional profile
│   │   ├── Appointment.js        # Appointment lifecycle
│   │   ├── Notification.js       # In-app notifications
│   │   └── Otp.js               # OTP verification codes
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   ├── appointment.routes.js
│   │   ├── notification.routes.js
│   │   └── admin.routes.js
│   ├── utils/
│   │   ├── errorHandler.js       # AppError class + global error handler
│   │   ├── jwt.js               # Token signing + verification
│   │   └── mailer.js            # Nodemailer email templates
│   ├── .env.example             # ← Environment variable template
│   ├── package.json
│   ├── seedAdmin.js             # Admin account seeder
│   └── server.js               # Express app entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html           # Google Fonts, meta tags
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosClient.js   # Axios instance with interceptors
│   │   │   └── services.js      # Domain-specific API service functions
│   │   ├── components/
│   │   │   ├── common/          # Shared reusable components
│   │   │   │   ├── BookingModal.jsx
│   │   │   │   ├── DoctorCard.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── StatusChip.jsx
│   │   │   │   └── ...
│   │   │   └── layout/          # Layout shells
│   │   │       ├── MinimalistLayout.jsx
│   │   │       ├── AppLayout.jsx
│   │   │       └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state + actions
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, Error pages
│   │   │   ├── patient/         # Patient dashboard + pages
│   │   │   ├── doctor/          # Doctor dashboard + pages
│   │   │   └── admin/           # Admin dashboard + pages
│   │   ├── theme/
│   │   │   └── index.js         # MUI theme + PALETTE tokens
│   │   ├── App.jsx              # Route tree
│   │   └── index.js            # React entry point
│   ├── .env.example            # ← Environment variable template
│   └── package.json
│
└── README.md
```

---

## 🔑 Role-Based Access

| Feature | Patient | Doctor | Admin |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | — |
| Google OAuth | ✅ | — | — |
| Search Doctors | ✅ | — | — |
| Book Appointment | ✅ | — | — |
| View Own Appointments | ✅ | ✅ | ✅ |
| Upload Medical Document | ✅ | — | — |
| Approve/Reject Appointments | — | ✅ | — |
| Mark Appointment Complete | — | ✅ | — |
| Manage Availability Schedule | — | ✅ | — |
| Approve/Reject Doctors | — | — | ✅ |
| Manage All Users | — | — | ✅ |
| View Platform Stats | — | — | ✅ |
| Cancel Any Appointment | — | — | ✅ |

---

## 📧 Email Notifications

The system sends automated HTML emails for:

| Event | Recipient |
|---|---|
| OTP verification code | User (registration) |
| Welcome email | New user |
| Appointment booked | Doctor (new request) |
| Appointment approved | Patient |
| Appointment rejected | Patient |
| Appointment completed | Patient |
| Appointment cancelled | Doctor |
| Doctor approved by admin | Doctor |
| Doctor rejected by admin | Doctor |

> In development without SMTP credentials, emails fall back to [Ethereal](https://ethereal.email/) (a free SMTP test service) and preview URLs are printed in the console.

---

## 🔒 Security Features

- **Helmet.js** — sets 15+ HTTP security headers
- **bcrypt** password hashing (cost factor 12)
- **JWT** with configurable expiry
- **CORS whitelist** with explicit allowed origins
- **Input validation** on all API endpoints
- **Rate limiting** protection
- **Soft-delete** (deactivation) instead of hard-deleting users
- **OTP expiry** (10 minutes) with max 5 attempts
- **SQL/NoSQL injection** protection via Mongoose schema validators

---

*Built with ❤️ for better healthcare access.*
