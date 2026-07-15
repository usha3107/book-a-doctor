# Project Design Phase — Problem-Solution Fit

**Date:** 15 February 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 4 Marks

---

## What is Problem-Solution Fit?

The Problem-Solution Fit simply means that you have found a problem with your customer and that the solution you have realized for it actually solves the customer's problem. It helps entrepreneurs, marketers, and corporate innovators identify behavioral patterns and recognize what would work and why.

---

## Problem-Solution Fit Canvas

### 1. CUSTOMER SEGMENT(S) [CS]

| Segment | Description |
|---|---|
| **CS-1: Patients** | Urban and semi-urban adults (20–60 yrs), tech-savvy, time-constrained, seeking quick specialist access without hospital queues |
| **CS-2: Doctors** | Licensed practitioners (GP and specialists) who want to expand their patient reach with minimal operational overhead |
| **CS-3: Platform Admin** | Healthcare operations managers who oversee doctor credentialing, data compliance, and platform governance |

---

### 2. JOBS-TO-BE-DONE / PROBLEMS [J&P]

| User | Job / Problem |
|---|---|
| Patient | Search and compare verified doctors by specialization, location, and fee; book an appointment in minutes without phone calls or in-person visits |
| Doctor | Digitally manage consultation schedule, availability, and patient appointment requests; maintain a trusted public professional profile |
| Admin | Verify doctor credentials before listing; monitor platform health; manage disputes and user data governance |

---

### 3. TRIGGERS [TR]

| User | Trigger |
|---|---|
| Patient | Sudden health concern; referral from a GP; preventive health checkup; long wait time at a hospital |
| Doctor | Competitive pressure from peers with digital profiles; referral drop-off from hospitals; desire to grow patient base independently |
| Admin | Doctor onboarding request; platform audit; user complaint |

---

### 4. EMOTIONS: BEFORE / AFTER [EM]

| User | Before Using MedConsult | After Using MedConsult |
|---|---|---|
| Patient | Anxious, overwhelmed, uncertain → "How do I even find a good specialist?" | Confident, relieved → "I have a confirmed appointment with a verified doctor." |
| Doctor | Disorganized, digitally absent → "I'm losing patients to competitors." | Empowered, visible → "Patients can find and book me 24/7." |
| Admin | Exposed to risk → "I can't monitor what's happening on the platform." | In control → "I have full governance and a single dashboard." |

---

### 5. AVAILABLE SOLUTIONS [AS]

| Alternative | Pros | Cons |
|---|---|---|
| Practo / 1mg | Established brand, large doctor network | Expensive listing for doctors; generic UI; poor customization |
| Hospital websites | Trusted institution | Not unified; per-hospital, no cross-search |
| WhatsApp / Phone | Familiar, immediate | No tracking, no verification, no digital records |
| Google Maps + reviews | Easy to find location | No booking engine, no medical document workflow |
| **MedConsult (Our Solution)** | Integrated search, booking, approval, document upload, and admin governance | New platform — requires doctor onboarding time |

---

### 6. CUSTOMER CONSTRAINTS [CC]

| Constraint | Description |
|---|---|
| Digital Literacy | Some patients and doctors in Tier-2 cities may have limited app familiarity |
| Trust Deficit | New platforms face skepticism — "How do I know this doctor is real?" |
| Data Privacy Concerns | Patients hesitant to upload medical documents to unknown platforms |
| Doctor Adoption | Established doctors may be reluctant to adopt new scheduling tools |
| Connectivity | Reliable internet needed for real-time notifications and appointment management |

---

### 7. BEHAVIOUR [BE]

| User | Current Behavior |
|---|---|
| Patient | Googles doctor names; asks friends on WhatsApp; calls hospitals; visits in person for availability |
| Doctor | Maintains WhatsApp group with clinic staff; uses handwritten appointment books or spreadsheets |
| Admin | Reviews PDF-scanned documents for doctor verification; relies on email-based reporting |

---

### 8. CHANNELS OF BEHAVIOUR [CH]

#### 8.1 Online Channels
- Google Search ("cardiologist near me")
- Practo app / competitor platforms
- LinkedIn (doctor profiles)
- Instagram / YouTube health influencers
- Hospital websites and portals

#### 8.2 Offline Channels
- Word-of-mouth referrals
- Hospital reception and telephone booking
- GP referral letters
- Local pharmacy recommendations
- Healthcare expos and medical conferences

---

### 9. PROBLEM ROOT CAUSE [RC]

The healthcare appointment booking ecosystem in India is **fragmented, undigitized, and opaque**:

1. **No unified discovery layer** — patients cannot compare specialists on a single verified platform.
2. **Trust gap** — no credentialed verification system to prove doctors are licensed.
3. **No digital workflow** — appointment lifecycle (book → approve → complete) handled through manual, error-prone channels.
4. **No patient empowerment** — medical documents travel via email/WhatsApp with no structured upload/download chain.
5. **No admin oversight** — platform operators cannot govern at scale without automated tools.

---

### 10. OUR SOLUTION [SL]

**MedConsult** is a full-stack MERN telemedicine platform that bridges the gap between patients and verified doctors:

| Feature | How It Solves the Problem |
|---|---|
| **Doctor Search with Filters** | Patients can search by specialization, city, fee range — no more guessing |
| **OTP-Verified Registration** | Only legitimate email accounts can register — reduces spam accounts |
| **JWT + Role-Based Auth** | Patients, doctors, and admins have separate secure access pathways |
| **Appointment Booking Flow** | One-step book → doctor approve/reject → patient notified via email + in-app |
| **Medical Document Upload** | Multer-based secure upload per appointment — structured and traceable |
| **In-App Notification System** | Real-time bell icon with unread counts; mark-all-read functionality |
| **Admin Dashboard** | Full CRUD on users, doctors, appointments with search and filter |
| **Doctor Credential Verification** | Admins approve doctors before they appear in search results |
| **Google OAuth Login** | Frictionless social login using @react-oauth/google library |

---

## References
1. [Problem-Solution Fit Canvas — IdeaHackers](https://www.ideahackers.network/problem-solution-fit-canvas/)
2. [Problem-Solution Fit Canvas — Medium](https://medium.com/@epicantus/problem-solution-fit-canvas-aa3dd59cb4fe)
3. Project: `shyamprasad001/MedConsult`
