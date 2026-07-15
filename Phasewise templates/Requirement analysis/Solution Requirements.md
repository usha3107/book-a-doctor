# Project Design Phase-II — Solution Requirements (Functional & Non-Functional)

**Date:** 31 January 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 4 Marks

---

## Functional Requirements

Following are the functional requirements of the proposed MedConsult solution.

| FR No. | Functional Requirement (Epic) | Sub-Requirements (Stories / Sub-Tasks) |
|---|---|---|
| **FR-1** | User Registration & Verification | Registration via email+password form / OTP email verification (10-min TTL) / Google OAuth registration / Separate pipelines for patient and doctor registration |
| **FR-2** | User Authentication & Authorization | JWT-based login / Role-based access control (patient, doctor, admin) / Middleware guards on all protected routes / bcryptjs password hashing / Password change endpoint |
| **FR-3** | Doctor Search & Discovery | Search doctors by specialization / Filter by city/location / Filter by consultation fee range (min/max) / Return only admin-verified doctors / Pagination support |
| **FR-4** | Doctor Profile Management | Doctors can update personal bio, specialization, experience, hospital / Update consultation fee / Set availability timings (day-of-week + time slots) / Upload profile photo (Multer) |
| **FR-5** | Appointment Booking (Patient) | Book appointment with doctor, date, time slot, and visit reason / View all own appointments with status / View appointment statistics (total, pending, approved, etc.) / Cancel pending appointment |
| **FR-6** | Appointment Management (Doctor) | View all incoming appointment requests / Approve a pending appointment / Reject a pending appointment with optional note / Mark approved appointment as completed |
| **FR-7** | Medical Document Upload | Patient uploads PDF/image document to a specific appointment / File stored with reference in appointment.documents[] / File size and type validation by Multer |
| **FR-8** | Notification System | Create notification on appointment status changes / In-app notification panel per user / Unread count displayed on bell icon / Mark all notifications as read |
| **FR-9** | Email Alerting | Nodemailer email on OTP verification / Email on appointment booking (to doctor) / Email on approval/rejection/completion (to patient) / Email on cancellation |
| **FR-10** | Admin — Doctor Governance | View all doctor registrations (pending/approved/rejected) / Approve a doctor (sets `isVerified: true`) / Reject a doctor / Search and filter doctor list |
| **FR-11** | Admin — User Management | View all registered patients / Search users by name or email / Deactivate / manage user accounts |
| **FR-12** | Admin — Appointment Management | View all appointments platform-wide / Search and filter by status, date, doctor, patient / View appointment detail |
| **FR-13** | Admin — Analytics Dashboard | Total users count / Total doctors count (verified vs. pending) / Total appointments by status / System health indicators |
| **FR-14** | Profile Management (Patient) | Update display name and phone number / Upload profile photo / Change password |
| **FR-15** | Error Handling & API Consistency | Global async error handler (express-async-errors) / Standardized JSON error responses / 404 handler for unknown routes / Input validation on all endpoints |

---

## Non-Functional Requirements

Following are the non-functional requirements of the proposed MedConsult solution.

| NFR No. | Non-Functional Requirement | Description | Technology / Approach |
|---|---|---|---|
| **NFR-1** | **Usability** | The platform must be intuitive for patients with varying technical literacy. UI components must be accessible, clearly labeled, and mobile-responsive. Doctor and admin dashboards must reduce cognitive load through grouped navigation and clear status indicators. | React.js + Material UI v5 (responsive design, ARIA labels, consistent color-coded status chips) |
| **NFR-2** | **Security** | All sensitive routes must be protected by JWT bearer token validation. Passwords must never be stored in plaintext. File uploads must be validated for MIME type and size. HTTP headers must be hardened against common attack vectors (XSS, clickjacking, MIME sniffing). CORS must only allow the configured client origin. | JWT (jsonwebtoken), bcryptjs (salt rounds: 12), Helmet.js (15+ security headers), Multer (type + size limits), CORS allowlist |
| **NFR-3** | **Reliability** | The API must handle unexpected errors gracefully without crashing the process. All async operations must be covered by the global error handler. Graceful shutdown must allow in-flight requests to complete before closing the database connection. MongoDB connection failures must be handled with clear logging and process exit. | express-async-errors, global `errorHandler` middleware, SIGTERM/SIGINT graceful shutdown, Mongoose `connectDB` with retry logic |
| **NFR-4** | **Performance** | API response payloads must be lean — only necessary fields returned. JSON body payloads are capped at 10KB to prevent DoS via oversized requests. MongoDB queries use indexed fields (email, doctorId, status, userId) for fast lookup. Static file uploads are served with `no-store` cache headers (medical documents must not be cached). | MongoDB indexes on frequently queried fields, `express.json({ limit: '10kb' })`, Mongoose `select()` projections, Morgan request logging for performance monitoring |
| **NFR-5** | **Scalability** | The stateless JWT architecture allows horizontal scaling — multiple API instances can run behind a load balancer without session affinity. MongoDB's document model supports flexible schema evolution without downtime migrations. The upload directory is decoupled and can be migrated to AWS S3 without API contract changes. | Stateless JWT (no server-side sessions), MongoDB Atlas auto-scaling, Multer storage abstraction (diskStorage → S3 storage swap) |
| **NFR-6** | **Maintainability** | Codebase is modularized by domain (auth, appointments, doctors, admin, notifications) with clear separation between routes, controllers, models, middleware, and utilities. Each module is independently testable. Extensive inline comments and JSDoc annotations throughout. | MVC + Service layer pattern, separate `routes/`, `controllers/`, `models/`, `middleware/`, `utils/` directories |
| **NFR-7** | **Availability** | The API must expose a health check endpoint (`GET /api/health`) for uptime monitoring and load balancer liveness probes. The application must survive MongoDB connection retries. | `/api/health` endpoint returning status + timestamp, `connectDB` with retry/exit strategy |
| **NFR-8** | **Data Integrity** | All MongoDB models use schema-level validation with required fields, enum constraints, and default values. Appointment status transitions follow a defined state machine — preventing illegal state jumps (e.g., completing a cancelled appointment). | Mongoose schema validators, `enum` fields, `pre-save` hooks, controller-level state validation |
| **NFR-9** | **Privacy & Compliance** | Medical documents must not be publicly accessible without authorization. Upload paths must not be guessable. Patient data must not be cross-exposed between unrelated users. Role middleware must prevent patients from accessing doctor or admin endpoints. | `requireAuth` + `requireUser` + `requireDoctor` middleware chain, Multer stores files with timestamped subdirectory paths, `no-store` cache headers on uploads |
| **NFR-10** | **Testability** | The Express app is exported as a module (`module.exports = app`) to support integration testing via Supertest + Jest. Controllers are pure async functions with no side effects that cannot be mocked. | `module.exports = app` in `server.js`, express-async-errors for clean test error propagation |

---

## References
- [Functional vs Non-Functional Requirements — Atlassian](https://www.atlassian.com/agile/project-management/requirements)
- [OWASP Security Guidelines](https://owasp.org/)
- Project: `shyamprasad001/MedConsult`
