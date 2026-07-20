# Brainstorm & Idea Prioritization Template

**Date:** 31 January 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 4 Marks

---

## Overview

Brainstorming provides a free and open environment that encourages everyone within a team to participate in the creative thinking process that leads to problem solving. Prioritizing volume over value, out-of-the-box ideas are welcome and built upon, and all participants are encouraged to collaborate.

**Session Details:**
- ⏱ 10 minutes to prepare
- ⏱ 1 hour to collaborate
- 👥 2–8 people recommended

---

## Before You Collaborate (10 minutes)

### A. Team Gathering
Define who should participate in the session and send an invite. Share relevant information or pre-work ahead.

| Role | Responsibility |
|---|---|
| Project Lead | Oversees brainstorming direction and session flow |
| Frontend Developer | Focuses on UI/UX feasibility and patient-facing features |
| Backend Developer | Evaluates API, data models, and scalability |
| Domain Expert (Healthcare) | Validates medical workflows and compliance requirements |

---

## Step 1: Define Problem Statement

**Problem:** How might we make it easier for patients to find qualified doctors and book appointments without the hassle of in-person visits or lengthy phone calls?

### Key Rules of Brainstorming
- Stay on topic.
- Encourage wild ideas.
- Defer judgment.
- Listen to others.
- Go for volume.
- If possible, be visual.

---

## Step 2: Brainstorm — Idea Listing

### 10-Minute Idea Generation

| Person | Ideas Generated |
|---|---|
| **Person 1** | Telemedicine platform with real-time video calls; AI-based symptom checker before booking |
| **Person 2** | Doctor search by specialization, location, availability, and fee range |
| **Person 3** | OTP-based account verification for patients; Google OAuth social login |
| **Person 4** | In-app notifications for appointment status updates (approved/rejected/completed) |
| **Person 5** | Admin dashboard for verifying doctor credentials before listing on platform |
| **Person 6** | Medical document upload by patients per appointment |
| **Person 7** | Doctor profile with timings, consultation fees, hospital affiliation |
| **Person 8** | Patient appointment history with status tracking and sprint-wise sprint burndown chart |

---

## Step 3: Group Ideas (20 minutes)

### Cluster 1: User Onboarding & Authentication
- OTP email verification for new patients
- Google OAuth (social login)
- Separate registration pipelines for patients and doctors
- Admin-driven doctor verification before listing

### Cluster 2: Doctor Discovery
- Search doctors by specialization, city, fee range, experience
- Doctor profile page with availability timings, fee, hospital
- Star ratings / review system (future)

### Cluster 3: Appointment Management
- Book appointment with date, time slot, and reason
- Approve / Reject / Complete flow on doctor's side
- Cancel appointment on patient's side
- Medical document upload per appointment

### Cluster 4: Communication & Notifications
- Email notifications on appointment status change
- In-app notification panel (bell icon) with unread count
- Future: SMS / WhatsApp alerts

### Cluster 5: Admin & Governance
- Admin dashboard to manage users, doctors, and appointments
- Doctor credential verification workflow
- Platform-wide analytics (total appointments, revenue, active doctors)

---

## Step 4: Idea Prioritization Grid (20 minutes)

Ideas placed on an **Importance vs. Feasibility** grid:

```
HIGH IMPORTANCE
│
│   [OTP Verification] ◀── HIGH Feasibility
│   [Doctor Search & Filters]
│   [Book Appointment]
│   [Appointment Status Flow]
│   [Admin Doctor Verification]
│
│   [In-App Notifications]     [Medical Doc Upload]
│
│   [Google OAuth Login]       [Video Consultation]    ← LOW Feasibility
│
LOW IMPORTANCE
└────────────────────────────────────────────────────
    LOW Feasibility                  HIGH Feasibility
```

### Priority Summary

| Idea | Importance | Feasibility | Decision |
|---|---|---|---|
| OTP Email Verification | High | High | ✅ Sprint 1 |
| JWT Authentication & Authorization | High | High | ✅ Sprint 1 |
| Doctor Search with Filters | High | High | ✅ Sprint 2 |
| Book / Cancel Appointment | High | High | ✅ Sprint 2 |
| Doctor Approve/Reject/Complete Flow | High | High | ✅ Sprint 3 |
| In-App Notifications | High | Medium | ✅ Sprint 3 |
| Medical Document Upload | Medium | High | ✅ Sprint 4 |
| Google OAuth Login | Medium | Medium | ✅ Sprint 4 |
| Admin Dashboard & Analytics | High | Medium | ✅ Sprint 5 |
| Video Consultation (WebRTC) | High | Low | 🔄 Future |
| AI Symptom Checker | Medium | Low | 🔄 Future |
| Patient Reviews & Ratings | Low | Medium | 🔄 Future |

---

## References
- [MURAL Brainstorm & Idea Prioritization Template](https://www.mural.co/templates/brainstorm-and-idea-prioritization)
- Project Repository: `shyamprasad001/MedConsult`
