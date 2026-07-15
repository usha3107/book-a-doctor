# Project Design Phase-II — Data Flow Diagram & User Stories

**Date:** 31 January 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 4 Marks

---

## Data Flow Diagrams

A Data Flow Diagram (DFD) is a traditional visual representation of the information flows within a system. It shows how data enters and leaves the system, what changes the information, and where data is stored.

---

### DFD Level 0 — System Overview (Context Diagram)

```
                    ┌─────────────────────────────────────┐
                    │                                     │
  Patient ─────────►│                                     │──────────► Patient
  [search, book,    │      MedConsult Platform            │  [appointment status,
   cancel, upload]  │      (Central System)               │   notifications,
                    │                                     │   doctor profiles]
  Doctor ──────────►│                                     │──────────► Doctor
  [approve, reject, │                                     │  [new booking alerts,
   update profile]  │                                     │   appointment history]
                    │                                     │
  Admin ───────────►│                                     │──────────► Admin
  [verify doctors,  │                                     │  [analytics, reports,
   manage users]    │                                     │   governance data]
                    │                                     │
  Google OAuth ────►│                                     │
  [ID Token]        └─────────────────────────────────────┘
                              │            │
                    ┌─────────┘            └─────────┐
                    ▼                                ▼
             ┌────────────┐                  ┌────────────┐
             │  MongoDB   │                  │  Nodemailer│
             │  Database  │                  │  SMTP      │
             └────────────┘                  └────────────┘
```

---

### DFD Level 1 — Authentication Sub-System

```
Patient/Doctor
     │
     ├──[Register Intent]──────────────────────────────────────────────┐
     │                                                                  ▼
     │                                               ┌──────────────────────────┐
     │                                               │  1. Register Intent      │
     │                                               │  • validate email format  │
     │                                               │  • generate 6-digit OTP   │
     │                                               │  • store in OTP collection │
     │                                               │    (TTL: 10 min)          │
     │                                               └────────────┬─────────────┘
     │                                                            │ [OTP email]
     │                                                            ▼
     │                                               ┌──────────────────────────┐
     │                                               │  Nodemailer SMTP         │
     │◄─────────────────[OTP delivered]─────────────│  → sends OTP to patient  │
     │                                               └──────────────────────────┘
     │
     ├──[Submit OTP]───────────────────────────────────────────────────┐
     │                                                                  ▼
     │                                               ┌──────────────────────────┐
     │                                               │  2. Verify OTP           │
     │                                               │  • lookup OTP in DB      │
     │                                               │  • check expiry          │
     │                                               │  • create User document  │
     │                                               │  • issue JWT             │
     │                                               └────────────┬─────────────┘
     │                                                            │
     │◄─────────────────[JWT Token]───────────────────────────────┘
     │
     ├──[Login with email+password]────────────────────────────────────┐
     │                                                                  ▼
     │                                               ┌──────────────────────────┐
     │                                               │  3. Login                │
     │                                               │  • find user by email    │
     │                                               │  • bcrypt.compare()      │
     │                                               │  • issue JWT (24h expiry)│
     │                                               └────────────┬─────────────┘
     │◄─────────────────[JWT Token]───────────────────────────────┘
     │
     └──[Google OAuth]─────────────────────────────────────────────────┐
                                                                        ▼
                                                       ┌──────────────────────────┐
                                                       │  4. Google Login         │
                                                       │  • verify ID token with  │
                                                       │    Google API            │
                                                       │  • upsert user by email  │
                                                       │  • issue JWT             │
                                                       └──────────────────────────┘
```

---

### DFD Level 1 — Appointment Booking Sub-System

```
Patient ──[Book Appointment]──► [1. Book Appointment]
                                 • validate patient JWT
                                 • check doctor exists + isVerified
                                 • create Appointment (status: pending)
                                 • create Notification for doctor
                                 • send email alert to doctor
                                        │
                                        ▼
                                 [D1. Appointments] ◄──────────────────────┐
                                        │                                   │
Doctor ──[View Appointments]──► [2. Fetch Doctor Appointments]             │
                                 • requireDoctor middleware                  │
                                 • filter by doctorId                       │
                                        │                                   │
                                 [3. Approve / Reject / Complete]           │
                                 • update status field                     │
                                 • create Notification for patient          │
                                 • send email to patient                    │
                                        │                                   │
Patient ──[Upload Document]───► [4. Upload Medical Document]               │
                                 • multer processes file                    │
                                 • push to appointment.documents[]          │
                                 • update updatedAt timestamp──────────────►┘
```

---

## User Stories

| User Type | Functional Requirement (Epic) | User Story No. | User Story / Task | Acceptance Criteria | Priority | Release |
|---|---|---|---|---|---|---|
| **Patient** | Registration | USN-1 | As a patient, I can initiate registration by entering my name, email, and password so that I receive a one-time verification code. | OTP email received; form does not proceed without valid OTP | High | Sprint 1 |
| **Patient** | Registration | USN-2 | As a patient, I can verify my OTP within 10 minutes to complete account creation. | Valid OTP → account created → JWT issued. Expired OTP → error shown | High | Sprint 1 |
| **Patient** | Registration | USN-3 | As a patient, I can register using my Google account for faster onboarding. | Google OAuth flow completes; user created/logged in; JWT issued | Medium | Sprint 4 |
| **Doctor** | Registration | USN-4 | As a doctor, I can register with my professional details (specialization, fee, hospital, experience) so that my profile is submitted for admin verification. | Doctor document created with `isVerified: false`; admin can see pending verification | High | Sprint 1 |
| **Patient/Doctor** | Login | USN-5 | As a registered user, I can log in with email and password to access my personalized dashboard. | Valid credentials → JWT → role-based redirect (patient/doctor/admin) | High | Sprint 1 |
| **Patient** | Doctor Discovery | USN-6 | As a patient, I can search for doctors by specialization, location, and fee range so that I can find the right doctor for my needs. | Search results match all applied filters; unverified doctors not shown | High | Sprint 2 |
| **Patient** | Doctor Discovery | USN-7 | As a patient, I can view a doctor's full profile including their timings, fee, hospital, and experience before booking. | Profile page loads with all fields; available timings clearly listed | High | Sprint 2 |
| **Patient** | Appointment Booking | USN-8 | As a patient, I can book an appointment with a selected doctor by choosing a date, time slot, and providing a reason for visit. | Appointment created with `status: pending`; doctor notified via email + in-app | High | Sprint 2 |
| **Patient** | Appointment Booking | USN-9 | As a patient, I can view all my past and upcoming appointments with their current status. | List shows status color indicators; sorted by date descending | High | Sprint 2 |
| **Patient** | Appointment Booking | USN-10 | As a patient, I can cancel a pending appointment if I no longer need it. | Only `pending` appointments can be cancelled; doctor notified on cancellation | High | Sprint 3 |
| **Patient** | Document Upload | USN-11 | As a patient, I can upload a medical document (PDF or image) to a specific appointment so the doctor has context before the consultation. | File uploaded via multipart/form-data; stored in appointment.documents[]; size limit enforced | Medium | Sprint 4 |
| **Doctor** | Appointment Management | USN-12 | As a doctor, I can view all appointment requests for my practice with patient details. | List shows pending first; patient name, date, time, reason visible | High | Sprint 3 |
| **Doctor** | Appointment Management | USN-13 | As a doctor, I can approve or reject a pending appointment with an optional note. | Status updates to `approved`/`rejected`; patient notified via email + in-app | High | Sprint 3 |
| **Doctor** | Appointment Management | USN-14 | As a doctor, I can mark an approved appointment as completed after the consultation. | Status updates to `completed`; record locked from further edits | High | Sprint 3 |
| **Doctor** | Profile Management | USN-15 | As a doctor, I can update my consultation fee, availability timings, and profile photo. | Changes reflected immediately in search results and profile page | Medium | Sprint 3 |
| **Patient/Doctor** | Notifications | USN-16 | As a user, I can view a notification panel with all unread updates about my appointments. | Bell icon shows unread count; clicking marks all as read | Medium | Sprint 3 |
| **Admin** | Doctor Governance | USN-17 | As an admin, I can view all pending doctor registrations and approve or reject them. | Approved doctors appear in patient search; rejected doctors cannot log in as doctor | High | Sprint 5 |
| **Admin** | Platform Management | USN-18 | As an admin, I can view, search, and manage all users, doctors, and appointments from a unified dashboard. | Full list with search/filter; able to deactivate accounts | High | Sprint 5 |
| **Admin** | Analytics | USN-19 | As an admin, I can view platform statistics (total users, doctors, appointments, completion rate) from the dashboard. | Stats displayed in real-time; charts update on refresh | Medium | Sprint 5 |

---

## References
- [Atlassian User Stories Guide](https://www.atlassian.com/agile/project-management/user-stories)
- Project: `shyamprasad001/MedConsult`
