# Project Design Phase — Solution Architecture

**Date:** 15 February 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 4 Marks

---

## What is Solution Architecture?

Solution architecture is a complex process that bridges the gap between business problems and technology solutions. Its goals are to:
- Find the best tech solution to solve existing business problems.
- Describe the structure, characteristics, behavior, and other aspects of the software to project stakeholders.
- Define features, development phases, and solution requirements.
- Provide specifications according to which the solution is defined, managed, and delivered.

---

## Architecture Overview — MedConsult Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               React.js Frontend (Port 3000)               │  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌─────────────┐  │  │
│  │  │  Auth Pages  │  │  Patient Pages  │  │ Doctor Pages│  │  │
│  │  │  Login/Reg   │  │  Search, Book,  │  │  Dashboard, │  │  │
│  │  │  Google OAuth│  │  Appointments   │  │  Timings    │  │  │
│  │  └──────────────┘  └─────────────────┘  └─────────────┘  │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │        Admin Pages  (Dashboard, Users, Doctors)     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │ HTTP/Axios                          │
└───────────────────────────┼──────────────────────────────────────┘
                            │ (REST API calls)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     SERVER LAYER (Port 5000)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Node.js + Express.js API Server               │  │
│  │                                                            │  │
│  │  Security Middleware: Helmet, CORS, Rate Limiting          │  │
│  │  Auth Middleware: JWT Verification, Role Guards            │  │
│  │                                                            │  │
│  │  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │  /auth   │ │  /doctors  │ │/appts    │ │ /admin   │  │  │
│  │  │ Register │ │   Search   │ │ Book     │ │ Users    │  │  │
│  │  │ Login    │ │ Profile    │ │ Approve  │ │ Doctors  │  │  │
│  │  │ OTP      │ │ Timings    │ │ Complete │ │ Stats    │  │  │
│  │  │ Google   │ │ Upload     │ │ Cancel   │ │          │  │  │
│  │  └──────────┘ └────────────┘ └──────────┘ └──────────┘  │  │
│  │                                                            │  │
│  │  File Upload: Multer (multipart/form-data)                │  │
│  │  Email Service: Nodemailer (OTP + appointment alerts)     │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                MongoDB (Atlas / Local)                     │  │
│  │                                                            │  │
│  │  Collections:                                              │  │
│  │  • users        — patients + admins                       │  │
│  │  • doctors      — verified practitioner profiles          │  │
│  │  • appointments — full lifecycle with documents array     │  │
│  │  • notifications — per-user notification messages         │  │
│  │  • otps          — time-limited OTP verification records  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │  External     │
                    │  Services     │
                    │               │
                    │ • Google OAuth│
                    │   (Sign-in)   │
                    │               │
                    │ • SMTP Server │
                    │   (Nodemailer │
                    │   OTP/Email)  │
                    └───────────────┘
```

---

## Architecture Data Flow — Step by Step

### Patient Booking Flow
1. **Patient** opens React frontend → navigates to Doctor Search
2. **Frontend** sends `GET /api/v1/doctors?specialization=cardiology&location=hyd` to Express API
3. **Express** queries MongoDB → returns matching doctor profiles
4. Patient selects a doctor → fills booking form → submits
5. **Frontend** sends `POST /api/v1/appointments` with JWT in Authorization header
6. **Auth Middleware** validates JWT → identifies patient role
7. **Appointment Controller** creates `Appointment` doc in MongoDB with `status: "pending"`
8. **Notification Controller** creates a `Notification` for the target doctor
9. **Nodemailer** sends email to doctor informing of new appointment request
10. Doctor logs in → approves → `status` changes to `"approved"`
11. **Nodemailer** sends confirmation email to patient
12. Patient receives in-app notification (bell icon) + email confirmation

### OTP Registration Flow
1. Patient submits registration intent → `POST /api/v1/auth/register-intent`
2. Backend generates a 6-digit OTP → stores in `otps` collection (TTL index: 10 mins)
3. **Nodemailer** sends OTP to patient's email
4. Patient submits OTP → `POST /api/v1/auth/verify-otp`
5. Backend validates OTP → creates `User` document → returns JWT

---

## Solution Architecture Diagram Description

| Layer | Component | Technology | Infrastructure |
|---|---|---|---|
| Client | React SPA | React 18, MUI v5, React Router v6 | Local / Vercel |
| API Gateway | Express Server | Node.js 18+, Express 4.x | Local / Render / Railway |
| Auth Service | JWT + OTP + Google OAuth | jsonwebtoken, bcryptjs, @react-oauth/google | Embedded in API |
| File Storage | Medical document upload | Multer (disk storage) | Local /uploads/ → prod: AWS S3 |
| Email Service | OTP + appointment alerts | Nodemailer + SMTP | Gmail / SendGrid |
| Database | Primary data store | MongoDB + Mongoose | MongoDB Atlas (Cloud) |
| Security | HTTP hardening | Helmet, CORS, express-async-errors | Embedded in API |

---

## Infrastructure Demarcation

```
┌─────────── LOCAL DEVELOPMENT ──────────────┐  ┌──── CLOUD (PRODUCTION) ────┐
│                                            │  │                            │
│  React Dev Server (port 3000)              │  │  Vercel (frontend)         │
│  Express API (port 5000)                   │  │  Render/Railway (backend)  │
│  MongoDB (localhost / Atlas Dev)           │  │  MongoDB Atlas             │
│  Multer → ./uploads/ directory             │  │  AWS S3 (file storage)     │
│  Nodemailer → Gmail SMTP                   │  │  SendGrid (email)          │
│                                            │  │                            │
└────────────────────────────────────────────┘  └────────────────────────────┘
```

---

## References
- [AWS Architecture Center](https://aws.amazon.com/architecture)
- [C4 Model for Software Architecture](https://c4model.com/)
- Project: `shyamprasad001/MedConsult`
