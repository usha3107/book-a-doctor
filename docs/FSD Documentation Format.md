# Full Stack Development with MERN — Project Documentation

**Project Title:** MedConsult – Book a Doctor  
**Team Members:** Shyam Prasad Mantri (Full Stack Developer — MERN)  
**GitHub Repository:** `shyamprasad001/MedConsult`

---

## 1. Introduction

### Project Title
**MedConsult – Book a Doctor**  
A full-stack telemedicine platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

### Team Members

| Name | Role |
|---|---|
| Shyam Prasad Mantri | Full Stack Developer — Backend (Node.js/Express/MongoDB) + Frontend (React.js/MUI) |

---

## 2. Project Overview

### Purpose
MedConsult bridges the gap between patients and verified doctors by providing a unified digital platform where:
- **Patients** can search, compare, and book appointments with verified specialist doctors without physical hospital visits.
- **Doctors** can manage their digital profile, availability timings, and appointment lifecycle from a dedicated dashboard.
- **Admins** can verify doctor credentials, govern user management, and monitor platform-wide analytics.

The platform eliminates the fragmented, manual, and opaque processes (phone calls, walk-ins, WhatsApp scheduling) that currently dominate healthcare appointment booking in India.

### Key Features

| Feature | Description |
|---|---|
| 🔐 OTP-Verified Registration | Email OTP verification with 10-minute TTL prevents fake account creation |
| 🔑 JWT Role-Based Auth | Three distinct roles — patient, doctor, admin — each with scoped API access |
| 🔍 Doctor Search | Filter by specialization, city, and fee range; only admin-verified doctors shown |
| 📅 Appointment Booking | Full lifecycle: book → approve/reject → complete/cancel with email + in-app alerts |
| 📄 Medical Document Upload | Patients attach PDF/image files to specific appointments (Multer) |
| 🔔 Notification System | In-app bell icon with unread count + per-event Nodemailer email alerts |
| 🛡 Admin Dashboard | Doctor verification, user/doctor/appointment management, platform statistics |
| 🌐 Google OAuth | Social login via @react-oauth/google library (no passwords required) |

---

## 3. Architecture

### Frontend
React.js 18 Single Page Application (SPA) built with:
- **Material UI v5** — design system with responsive grid, data tables, form components
- **React Router v6** — client-side routing with role-based `ProtectedRoute` wrapper
- **Axios** — HTTP client with a custom API base instance and JWT injection
- **Styled Components + Emotion** — component-scoped CSS
- **AuthContext** — global React Context managing logged-in user state + token

**Role-Based Route Structure:**
```
/ → /login (public)
/patient/* → ProtectedRoute(role="user")
/doctor/*  → ProtectedRoute(role="doctor")
/admin/*   → ProtectedRoute(role="admin")
```

### Backend
Node.js + Express.js REST API organized by domain:
- **Security**: Helmet (HTTP headers), CORS (allowlist), body-parser limit (10KB)
- **Auth**: JWT + bcryptjs + Nodemailer OTP + Google OAuth ID token verification
- **File Upload**: Multer diskStorage with MIME/size validation
- **Error Handling**: express-async-errors + global `errorHandler` middleware
- **Graceful Shutdown**: SIGTERM/SIGINT handlers with MongoDB connection cleanup

**API Namespace:** `POST/GET/PUT/DELETE /api/v1/{auth|doctors|appointments|notifications|admin}`

### Database
MongoDB with Mongoose ODM — 5 collections:

| Collection | Purpose |
|---|---|
| `users` | Patient and admin accounts (email, passwordHash, role, profilePhoto) |
| `doctors` | Verified practitioner profiles (specialization, fee, timings, isVerified) |
| `appointments` | Full booking lifecycle (status enum, documents[], patient/doctor refs) |
| `notifications` | Per-user in-app messages with isRead flag |
| `otps` | Email verification codes with TTL index (auto-deleted after 10 minutes) |

---

## 4. Setup Instructions

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- npm 9+
- A Gmail account for Nodemailer (or another SMTP provider)
- Google Cloud Console project with OAuth 2.0 credentials (for Google login)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/shyamprasad001/MedConsult.git
cd MedConsult

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure backend environment variables
# Create backend/.env with the following:
# PORT=5000
# NODE_ENV=development
# MONGO_URI=mongodb://localhost:27017/medconsult
# JWT_SECRET=your_super_secret_jwt_key
# JWT_EXPIRES_IN=24h
# CLIENT_ORIGIN=http://localhost:3000
# EMAIL_FROM=your_gmail@gmail.com
# EMAIL_PASS=your_gmail_app_password
# GOOGLE_CLIENT_ID=your_google_oauth_client_id

# 4. Seed the admin account
node seedAdmin.js

# 5. Install frontend dependencies
cd ../frontend
npm install

# 6. Configure frontend environment variables
# Create frontend/.env with:
# REACT_APP_API_URL=http://localhost:5000
# REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## 5. Folder Structure

### Backend (`/backend`)

```
backend/
├── config/
│   ├── db.js              # MongoDB connection + retry logic
│   └── multer.js          # Multer diskStorage configuration
├── controllers/
│   ├── auth.controller.js        # Registration, OTP, login, Google OAuth, profile
│   ├── appointment.controller.js # Book, approve, reject, complete, cancel, upload
│   ├── doctor.controller.js      # Search, profile, timings, photo upload
│   ├── admin.controller.js       # User/doctor/appointment management + stats
│   └── notification.controller.js # Fetch, mark-read
├── middleware/
│   └── auth.middleware.js  # requireAuth, requireUser, requireDoctor, requireAdmin
├── models/
│   ├── User.js             # Patient + admin schema
│   ├── Doctor.js           # Practitioner schema with timings[] subdocument
│   ├── Appointment.js      # Appointment schema with documents[] + status enum
│   ├── Notification.js     # Per-user notification messages
│   └── Otp.js              # TTL-indexed OTP verification codes
├── routes/
│   ├── auth.routes.js
│   ├── appointment.routes.js
│   ├── doctor.routes.js
│   ├── notification.routes.js
│   └── admin.routes.js
├── utils/
│   └── errorHandler.js     # AppError class + global Express error handler
├── uploads/               # Multer-managed file storage (gitignored in prod)
├── seedAdmin.js           # One-time admin account seeder
├── server.js              # Entry point — app setup + bootstrap
└── .env                   # Environment variables (not committed)
```

### Frontend (`/frontend`)

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/               # Axios instances + per-domain API functions
│   ├── assets/            # Static images and icons
│   ├── components/
│   │   ├── common/        # ProtectedRoute, shared UI components
│   │   └── layout/        # MinimalistLayout (sidebar + outlet)
│   ├── context/
│   │   └── AuthContext.jsx # Global auth state + useAuth() hook
│   ├── hooks/             # Custom React hooks (e.g. useNotifications)
│   ├── pages/
│   │   ├── auth/          # LoginPage, RegisterPage, ErrorPages
│   │   ├── patient/       # Dashboard, DoctorSearch, Appointments, Profile
│   │   ├── doctor/        # Dashboard, AppointmentsPage, ProfilePage
│   │   └── admin/         # Dashboard, Users, Doctors, Appointments
│   ├── theme/             # MUI custom theme (palette, typography)
│   ├── utils/             # Helper functions (date formatting, validators)
│   ├── App.jsx            # Root component + complete route tree
│   └── index.js           # ReactDOM.createRoot entry point
└── .env                   # Frontend environment variables (not committed)
```

---

## 6. Running the Application

```bash
# Start Backend (from /backend directory)
npm run dev          # Development (Nodemon hot-reload, port 5000)
npm start            # Production (Node.js, port 5000)

# Start Frontend (from /frontend directory)
npm start            # Development (CRA dev server, port 3000)
npm run build        # Production build (output: /build)
```

**Verify the app is running:**
- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/api/health`

---

## 7. API Documentation

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register-intent` | Public | Send OTP to email to initiate registration |
| POST | `/verify-otp` | Public | Verify OTP and create user account |
| POST | `/register` | Public | Legacy direct patient registration |
| POST | `/register/patient` | Public | Dedicated patient registration pipeline |
| POST | `/register/doctor` | Public | Dedicated doctor registration (isVerified: false) |
| POST | `/google` | Public | Google OAuth login with ID token |
| POST | `/login` | Public | Email + password login; returns JWT |
| GET | `/me` | JWT | Fetch own user profile |
| PUT | `/password` | JWT | Change own password |
| PUT | `/profile` | JWT | Update name / phone |
| POST | `/photo` | JWT | Upload profile picture (multipart) |

### Doctor Routes (`/api/v1/doctors`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Search doctors (query: specialization, location, minFee, maxFee) |
| GET | `/:id` | Public | Get single doctor profile by ID |
| GET | `/me/profile` | Doctor | Get own doctor profile |
| PUT | `/me/profile` | Doctor | Update own doctor profile |
| PUT | `/me/timings` | Doctor | Update availability timings |
| POST | `/me/photo` | Doctor | Upload profile photo (multipart) |

### Appointment Routes (`/api/v1/appointments`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Patient | Book a new appointment |
| GET | `/my` | Patient | Get own appointments |
| GET | `/my/stats` | Patient | Get appointment statistics |
| DELETE | `/:id/cancel` | Patient | Cancel a pending appointment |
| POST | `/:id/document` | Patient | Upload medical document to appointment |
| GET | `/doctor` | Doctor | Get all appointments for this doctor |
| PUT | `/:id/approve` | Doctor | Approve a pending appointment |
| PUT | `/:id/reject` | Doctor | Reject a pending appointment |
| PUT | `/:id/complete` | Doctor | Mark appointment as completed |
| GET | `/:id` | JWT | Get appointment by ID (patient/doctor/admin) |

### Notification Routes (`/api/v1/notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | Get all notifications for current user |
| PUT | `/mark-read` | JWT | Mark all notifications as read |

### Admin Routes (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform statistics |
| GET | `/users` | Admin | List all users |
| GET | `/doctors` | Admin | List all doctors |
| PUT | `/doctors/:id/verify` | Admin | Approve doctor registration |
| PUT | `/doctors/:id/reject` | Admin | Reject doctor registration |
| GET | `/appointments` | Admin | List all appointments |

**Example Response (POST /api/v1/auth/login):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Priya S.",
    "email": "priya@example.com",
    "type": "user"
  }
}
```

---

## 8. Authentication

### Strategy
MedConsult uses **stateless JWT (JSON Web Token)** authentication:
1. On successful login, the server signs a JWT with `JWT_SECRET` and `JWT_EXPIRES_IN` (default: 24h).
2. The client stores the token in React state (via `AuthContext`) and optionally in `localStorage`.
3. All protected API requests include `Authorization: Bearer <token>` header.
4. The `requireAuth` middleware verifies the token and attaches `req.user` to the request.
5. Role-specific middleware (`requireUser`, `requireDoctor`, `requireAdmin`) checks `req.user.type`.

### OTP Verification Flow
1. `POST /register-intent` → generates 6-digit OTP → stored in `otps` collection (TTL: 10 min) → sent via Nodemailer.
2. `POST /verify-otp` → validates OTP, checks expiry → creates user → returns JWT.

### Google OAuth Flow
1. Frontend (@react-oauth/google) shows Google sign-in popup → user authenticates → receives `id_token`.
2. Frontend sends `id_token` to `POST /api/v1/auth/google`.
3. Backend verifies token with Google API → upserts User by email → returns JWT.

### Password Security
- bcryptjs with **12 salt rounds** for all password hashes.
- Passwords never returned in API responses (Mongoose `select: false` on `password` field).

---

## 9. User Interface

### Pages by Role

**Patient:**
- `/login` — Login with email/password or Google OAuth
- `/register` — Registration with OTP verification (patient or doctor)
- `/patient/dashboard` — Welcome panel with quick stats
- `/patient/search` — Doctor search with specialization, location, fee filters
- `/patient/appointments` — Appointment list with status chips
- `/patient/profile` — Profile edit + photo upload + password change

**Doctor:**
- `/doctor/dashboard` — Overview of upcoming appointments + quick actions
- `/doctor/appointments` — Appointment list with approve/reject/complete actions
- `/doctor/profile` — Profile edit + timings management + photo upload

**Admin:**
- `/admin/dashboard` — Platform-wide stats (users, doctors, appointments)
- `/admin/users` — User management table
- `/admin/doctors` — Doctor verification queue + approved list
- `/admin/appointments` — All appointments with search and filter

---

## 10. Testing

### Testing Strategy
- **Manual Testing**: All 34 test cases in `User Acceptance Testing FSD.md` executed manually across all three roles.
- **API Testing**: Postman collection tested all REST endpoints with valid and invalid inputs.
- **Browser Testing**: Chrome DevTools used to monitor network calls, auth token flow, and file upload requests.

### Tools Used

| Tool | Purpose |
|---|---|
| Postman | REST API endpoint testing |
| Chrome DevTools | Network monitoring, JWT inspection |
| MongoDB Compass | Direct database inspection |
| Nodemon | Live reload during development |
| morgan | HTTP request logging |

---

## 11. Screenshots or Demo

> Screenshots to be added from the running application.

**Key screens:**
1. Login Page — email/password + Google OAuth button
2. Patient Dashboard — quick stats + navigation
3. Doctor Search — filter panel + result cards
4. Book Appointment Modal — date, time slot, reason
5. Patient Appointments — status-coded list
6. Doctor Dashboard — appointment queue with approve/reject
7. Admin Dashboard — analytics tiles + doctor verification table
8. Notification Panel — bell icon with unread count

---

## 12. Known Issues

| Issue | Status | Notes |
|---|---|---|
| Google OAuth "Access Denied" on non-allowed accounts | ✅ Fixed | Configure GCP OAuth consent screen + allowed emails |
| Doctor appointment approval 500 error | ✅ Fixed | Unterminated JSDoc comment in controller — fixed |
| CORS block from port 5173 | ✅ Fixed | Added `http://localhost:5173` to `CLIENT_ORIGIN` |
| Notification polling too aggressive (every 5s) | ✅ Fixed | Reduced to 30s polling interval |
| Google profile image 429 Too Many Requests | ✅ Fixed | Image URL cached; not re-fetched on every render |
| Medical document upload size limit not enforced | 🔄 Pending | Multer limits configured but UI error message needed |

---

## 13. Future Enhancements

| Enhancement | Priority | Description |
|---|---|---|
| **Video Consultation (WebRTC)** | High | Real-time video call between patient and doctor via WebRTC or Agora.io SDK |
| **AI Symptom Checker** | Medium | Pre-booking symptom analysis using GPT-4 API to suggest appropriate specialization |
| **Patient Reviews & Ratings** | Medium | Post-consultation rating system for doctors (1–5 stars + review text) |
| **Mobile App (React Native)** | High | Cross-platform iOS/Android app with push notifications |
| **Prescription Management** | Medium | Doctors upload digital prescriptions per completed appointment |
| **Multi-Language Support (i18n)** | Low | Hindi, Telugu, Tamil language support using react-i18next |
| **Health Insurance Integration** | Low | Link appointments to insurance claim APIs |
| **AWS S3 File Storage** | High | Migrate Multer local storage to AWS S3 for production scalability |
| **SMS Notifications** | Medium | Twilio SMS alerts for appointment reminders |
| **Analytics Dashboard v2** | Low | Revenue tracking, doctor performance metrics, appointment trend charts |
| **CI/CD Pipeline** | High | GitHub Actions for automated test + deploy to cloud on merge to main |

---

## References
- [React.js Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Material UI Documentation](https://mui.com)
- [JWT Introduction](https://jwt.io/introduction)
- [Helmet.js](https://helmetjs.github.io/)
- Project Repository: `shyamprasad001/MedConsult`
