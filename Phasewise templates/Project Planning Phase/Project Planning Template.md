# Project Planning Phase — Product Backlog, Sprint Planning & Story Points

**Date:** 15 February 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 5 Marks

---

## Product Backlog, Sprint Schedule & Estimation

### Product Backlog & Sprint Assignment

| Sprint | Functional Requirement (Epic) | User Story No. | User Story / Task | Story Points | Priority | Team Members |
|---|---|---|---|---|---|---|
| **Sprint 1** | Project Setup | USN-0 | Initialize MERN monorepo; configure ESLint, .env, .gitignore; set up MongoDB Atlas connection; scaffold Express server with Helmet, CORS, Morgan | 3 | High | All |
| **Sprint 1** | Registration | USN-1 | As a patient, I can initiate registration by entering name, email, and password to receive an OTP email | 3 | High | Backend Dev |
| **Sprint 1** | Registration | USN-2 | As a patient, I can verify my OTP within 10 minutes to complete account creation and receive a JWT | 2 | High | Backend Dev |
| **Sprint 1** | Registration | USN-4 | As a doctor, I can register with professional details (specialization, fee, hospital, experience) for admin verification | 3 | High | Backend Dev |
| **Sprint 1** | Login | USN-5 | As a registered user, I can log in with email+password and be redirected to my role-based dashboard | 2 | High | Backend Dev |
| **Sprint 1** | Login | USN-5b | Frontend: Build Login and Register pages with role-selection (patient/doctor); connect to auth API | 3 | High | Frontend Dev |
| **Sprint 1** | Auth Middleware | USN-5c | Implement JWT middleware (requireAuth, requireUser, requireDoctor, requireAdmin); protect all non-public routes | 3 | High | Backend Dev |
| **Sprint 2** | Doctor Search | USN-6 | As a patient, I can search doctors by specialization, city, and fee range; only verified doctors appear | 3 | High | Backend + Frontend |
| **Sprint 2** | Doctor Profile | USN-7 | As a patient, I can view a doctor's full profile — timings, fee, hospital, experience — before booking | 2 | High | Frontend Dev |
| **Sprint 2** | Doctor Profile Mgmt | USN-15a | As a doctor, I can update my bio, specialization, consultation fee, and hospital via my profile page | 2 | Medium | Backend + Frontend |
| **Sprint 2** | Doctor Availability | USN-15b | As a doctor, I can set my weekly availability timings (day + start/end time) | 3 | Medium | Backend + Frontend |
| **Sprint 2** | Appointment Booking | USN-8 | As a patient, I can book an appointment by selecting doctor, date, time, and reason | 3 | High | Backend + Frontend |
| **Sprint 2** | My Appointments | USN-9 | As a patient, I can view all my appointments with status indicators | 2 | High | Frontend Dev |
| **Sprint 3** | Appointment Mgmt | USN-12 | As a doctor, I can view all incoming appointment requests on my dashboard | 2 | High | Backend + Frontend |
| **Sprint 3** | Appointment Mgmt | USN-13 | As a doctor, I can approve or reject a pending appointment | 2 | High | Backend Dev |
| **Sprint 3** | Appointment Mgmt | USN-14 | As a doctor, I can mark an approved appointment as completed after the consultation | 2 | High | Backend Dev |
| **Sprint 3** | Cancel Appointment | USN-10 | As a patient, I can cancel a pending appointment | 1 | High | Backend + Frontend |
| **Sprint 3** | Notifications | USN-16a | Backend: Create notification document on every appointment status change | 2 | Medium | Backend Dev |
| **Sprint 3** | Notifications | USN-16b | Frontend: Build notification bell icon with unread count and notification panel | 2 | Medium | Frontend Dev |
| **Sprint 3** | Email Alerts | USN-9b | Send Nodemailer emails on booking, approval, rejection, completion, cancellation | 3 | Medium | Backend Dev |
| **Sprint 4** | Document Upload | USN-11 | As a patient, I can upload a medical document to a specific appointment | 3 | Medium | Backend + Frontend |
| **Sprint 4** | Photo Upload | USN-15c | As a patient or doctor, I can upload a profile photo | 2 | Low | Backend + Frontend |
| **Sprint 4** | Google OAuth | USN-3 | As a user, I can register/login using my Google account | 3 | Medium | Backend + Frontend |
| **Sprint 4** | Password Change | USN-5d | As a logged-in user, I can change my password from the profile page | 1 | Low | Backend + Frontend |
| **Sprint 5** | Admin Dashboard | USN-18 | As an admin, I can view platform-wide users, doctors, and appointments in one dashboard | 3 | High | Backend + Frontend |
| **Sprint 5** | Admin Doctor Mgmt | USN-17 | As an admin, I can approve or reject doctor registration requests | 2 | High | Backend + Frontend |
| **Sprint 5** | Admin Analytics | USN-19 | As an admin, I can view platform statistics: total users, doctors, appointments by status | 2 | Medium | Frontend Dev |
| **Sprint 5** | FSD Documentation | — | Complete all phase-wise documentation (Brainstorming, DFD, Solution Architecture, UAT) | 3 | High | All |

---

## Sprint Schedule

| Sprint | Total Story Points | Duration | Sprint Start Date | Sprint End Date (Planned) | Story Points Completed | Sprint Release Date (Actual) |
|---|---|---|---|---|---|---|
| **Sprint 1** | 19 | 7 Days | 01 Feb 2025 | 07 Feb 2025 | 19 | 07 Feb 2025 |
| **Sprint 2** | 18 | 7 Days | 08 Feb 2025 | 14 Feb 2025 | 18 | 14 Feb 2025 |
| **Sprint 3** | 17 | 7 Days | 15 Feb 2025 | 21 Feb 2025 | 17 | 21 Feb 2025 |
| **Sprint 4** | 9 | 5 Days | 22 Feb 2025 | 26 Feb 2025 | 9 | 26 Feb 2025 |
| **Sprint 5** | 10 | 5 Days | 27 Feb 2025 | 03 Mar 2025 | 10 | 03 Mar 2025 |
| **TOTAL** | **73** | **31 Days** | 01 Feb 2025 | 03 Mar 2025 | | |

---

## Velocity Calculation

**Team Velocity** = Story Points Completed per Sprint

| Sprint | Completed Points | Cumulative | Notes |
|---|---|---|---|
| Sprint 1 | 19 | 19 | Foundation sprint — setup + auth |
| Sprint 2 | 18 | 37 | Core features — search + booking |
| Sprint 3 | 17 | 54 | Appointment lifecycle + notifications |
| Sprint 4 | 9 | 63 | Enhancements — uploads + OAuth |
| Sprint 5 | 10 | 73 | Admin + documentation |

**Average Velocity** = 73 ÷ 5 = **~14.6 points/sprint**

```
Sprint Velocity Chart:
Points
20 |  ██
18 |  ██  ██
16 |  ██  ██  ██
14 |  ██  ██  ██
12 |  ██  ██  ██
10 |  ██  ██  ██  ██  ██
 8 |  ██  ██  ██  ██  ██
 6 |  ██  ██  ██  ██  ██
 4 |  ██  ██  ██  ██  ██
 2 |  ██  ██  ██  ██  ██
 0 +─────────────────────
     S1  S2  S3  S4  S5
```

---

## Burndown Chart (Sprint 1 — Example)

Sprint 1 Total: 19 Story Points over 7 days  
Ideal burndown rate: 19 ÷ 7 ≈ 2.7 points/day

| Day | Ideal Remaining | Actual Remaining |
|---|---|---|
| Day 0 (Start) | 19 | 19 |
| Day 1 | 16.3 | 16 |
| Day 2 | 13.6 | 13 |
| Day 3 | 10.9 | 11 |
| Day 4 | 8.2 | 8 |
| Day 5 | 5.5 | 5 |
| Day 6 | 2.7 | 2 |
| Day 7 (End) | 0 | 0 |

```
Burndown (Sprint 1):
Points
20 |*
18 | \*
16 |  \*
14 |   \*
12 |    \*
10 |     \*
 8 |      \*
 6 |       \*
 4 |        \*
 2 |         \*
 0 |          *
   +────────────
     D0  D1  D2  D3  D4  D5  D6  D7
   (* = Ideal line; team tracked on/ahead of ideal)
```

---

## References
- [Atlassian Agile Project Management](https://www.atlassian.com/agile/project-management)
- [Atlassian Epics](https://www.atlassian.com/agile/tutorials/epics)
- [Atlassian Sprints](https://www.atlassian.com/agile/tutorials/sprints)
- [Atlassian Story Point Estimation](https://www.atlassian.com/agile/project-management/estimation)
- [Scrum Burndown Chart — Visual Paradigm](https://www.visual-paradigm.com/scrum/scrum-burndown-chart/)
- Project: `shyamprasad001/MedConsult`
