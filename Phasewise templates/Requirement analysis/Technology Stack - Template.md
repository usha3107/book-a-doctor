# Technology Stack & Architecture

**Date:** 31 January 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 4 Marks

---

## Technical Architecture Overview

MedConsult is a **3-Tier Web Application** built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js):

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TIER 1: PRESENTATION LAYER                                              │
│                                                                          │
│  React.js SPA  ←→  Material UI v5  ←→  React Router v6                 │
│  Styled Components  ←→  Axios (REST client)  ←→  @react-oauth/google   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ HTTP / REST (Axios)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  TIER 2: APPLICATION / LOGIC LAYER                                       │
│                                                                          │
│  Node.js 18+  ←→  Express.js 4.x  ←→  JWT Auth  ←→  Multer            │
│  Helmet  ←→  CORS  ←→  Morgan  ←→  Nodemailer  ←→  bcryptjs           │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ Mongoose ODM
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  TIER 3: DATA LAYER                                                      │
│                                                                          │
│  MongoDB (Atlas or Local)  ←→  Mongoose 8.x                            │
│  Collections: users, doctors, appointments, notifications, otps         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Table 1: Components & Technologies

| S.No | Component | Description | Technology |
|---|---|---|---|
| **1.** | **User Interface** | Web SPA for patients (search, book, appointments), doctors (dashboard, profile, timings), and admin (governance, analytics). Responsive design with consistent Material Design components. | React.js 18, Material UI v5, Emotion (CSS-in-JS), Styled Components v6, React Router DOM v6 |
| **2.** | **API Client** | HTTP communication layer between React frontend and Express REST API. Handles request headers, JWT bearer tokens, and response parsing. | Axios 1.6.x with custom API base instance (`/src/api/`) |
| **3.** | **Authentication Logic** | Issues and validates JSON Web Tokens for stateless authentication. Hashes passwords using bcrypt. Validates Google OAuth ID tokens. Generates and verifies OTP codes via email. | jsonwebtoken 9.x, bcryptjs 2.4.x, @react-oauth/google 0.13.x, Nodemailer 9.x |
| **4.** | **REST API Server** | Handles all business logic: user registration, doctor search, appointment lifecycle, file upload, notification management, and admin operations. | Node.js 18+, Express.js 4.18.x, express-async-errors 3.x |
| **5.** | **Security Middleware** | Sets 15+ HTTP security headers to prevent XSS, clickjacking, MIME sniffing, and other web attacks. Enforces CORS policy to only allow the configured client origin. Rate-limits future-ready. | Helmet 7.x, CORS 2.8.x |
| **6.** | **Request Logger** | Logs all incoming HTTP requests with method, URL, status code, and response time for debugging and monitoring. | Morgan 1.10.x (dev format in development, combined/Apache format in production) |
| **7.** | **Database** | Document-oriented NoSQL database storing all platform data. Schema enforced via Mongoose ODM with validators, indexes, and TTL (Time-To-Live) for OTP expiry. | MongoDB 7.x (Mongoose 8.x ODM) |
| **8.** | **File Storage** | Handles multipart/form-data for profile photo uploads (patient + doctor) and medical document uploads per appointment. Files organized in timestamped subdirectories. | Multer 1.4.x (local diskStorage → production: AWS S3 / Cloudinary) |
| **9.** | **Email Service** | Sends transactional emails for OTP verification and appointment status changes (booking confirmation, approval, rejection, completion, cancellation). | Nodemailer 9.x with Gmail SMTP (production: SendGrid / AWS SES) |
| **10.** | **Date & Time Utilities** | Handles date parsing, formatting, and manipulation for appointment scheduling, availability timings, and display throughout the platform. | Day.js 1.11.x |
| **11.** | **Infrastructure — Development** | Local development servers for frontend and backend with hot-reload. | Frontend: `react-scripts start` (CRA, port 3000); Backend: Nodemon 3.x + Node.js (port 5000) |
| **12.** | **Infrastructure — Production** | Stateless API deployable behind any load balancer. Frontend as static build on CDN. Database on managed cloud service. | Frontend: Vercel / Netlify; Backend: Render / Railway / Fly.io; DB: MongoDB Atlas |

---

## Table 2: Application Characteristics

| S.No | Characteristic | Description | Technology |
|---|---|---|---|
| **1.** | **Open-Source Frameworks** | Entire MERN stack built on MIT-licensed open-source libraries. No proprietary vendor lock-in for core functionality. | React 18 (MIT), Express.js (MIT), Mongoose (MIT), MongoDB Community (SSPL), Material UI (MIT) |
| **2.** | **Security Implementations** | **Password Hashing**: bcryptjs with 12 salt rounds (adaptive cost factor). **JWT Signing**: HS256 with configurable secret and 24h expiry. **HTTP Headers**: Helmet sets Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, HSTS, and 10+ more. **Input Validation**: JSON body limit 10KB to prevent DoS. **CORS**: Strict allowlist — only configured CLIENT_ORIGIN accepted. **File Validation**: Multer enforces file type and size limits. | bcryptjs, jsonwebtoken, Helmet, CORS, Multer, Express body-parser limits |
| **3.** | **Scalable Architecture** | **3-Tier Architecture** separates presentation, logic, and data — each layer scales independently. **Stateless JWT** allows horizontal API scaling (no session affinity required). **MongoDB** supports horizontal sharding for large datasets. **Domain-based module structure** enables extraction to microservices when needed. | 3-tier MVC, stateless JWT, MongoDB Atlas Auto-Scaling, Express Router per domain |
| **4.** | **Availability** | **Health Check Endpoint** (`GET /api/health`) for load balancer liveness probes. **Graceful Shutdown** on SIGTERM/SIGINT — waits for in-flight requests before closing DB connection. **MongoDB connection retry** in `connectDB`. **Unhandled rejection** handler prevents process crashes. | `/api/health` endpoint, `server.close()` + `mongoose.connection.close()`, `process.on('unhandledRejection')` |
| **5.** | **Performance** | **JSON payload limit** 10KB prevents oversized request DoS. **Mongoose indexed queries** on `email`, `userId`, `doctorId`, `status` fields. **Lean API responses** — only required fields selected via Mongoose `select()`. **No-store headers** on `/uploads/` to prevent medical data caching. **CRA Production Build** minifies and chunks JS for fast initial load. | `express.json({ limit: '10kb' })`, Mongoose indexes, `Cache-Control: no-store`, CRA build optimization |

---

## Architecture Diagram — Data Flow Summary

```
User (Browser)
    │
    │  HTTPS
    ▼
React SPA (port 3000)
    │
    │  REST API (Axios) — Bearer JWT in Authorization header
    ▼
Express API Server (port 5000)
    ├── Helmet      → HTTP security headers
    ├── CORS        → origin allowlist
    ├── Morgan      → request logging
    ├── Auth MW     → JWT verify + role guard
    ├── Routes      → /auth, /doctors, /appointments, /notifications, /admin
    ├── Controllers → business logic per domain
    ├── Multer      → file upload handling
    ├── Nodemailer  → transactional email dispatch
    │
    │  Mongoose ODM
    ▼
MongoDB Database
    ├── users          (patients, admins)
    ├── doctors        (practitioner profiles + availability)
    ├── appointments   (full lifecycle + documents[])
    ├── notifications  (per-user messages)
    └── otps           (TTL-indexed verification codes)

External Services:
    ├── Google OAuth API → ID token verification
    └── SMTP Server      → email delivery (Gmail / SendGrid)
```

---

## References
- [C4 Model for Documenting Architecture](https://c4model.com/)
- [IBM Architecture Center](https://www.ibm.com/cloud/architecture)
- [AWS Architecture Examples](https://aws.amazon.com/architecture)
- Project: `shyamprasad001/MedConsult`
