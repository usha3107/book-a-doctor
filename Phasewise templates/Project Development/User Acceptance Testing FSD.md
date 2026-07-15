# User Acceptance Testing (UAT) Template

**Date:** 03 March 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** As specified

---

## Project Overview

| Field | Details |
|---|---|
| **Project Name** | MedConsult – Book a Doctor |
| **Project Description** | A full-stack MERN telemedicine platform enabling patients to search verified doctors, book appointments, upload medical documents, and receive real-time notifications. Doctors manage their schedule and appointments. Admins govern doctor verification and platform health. |
| **Project Version** | v1.0.0 |
| **Testing Period** | 27 February 2025 to 03 March 2025 |

---

## Testing Scope

### Features to Be Tested
- Patient registration with OTP verification
- Google OAuth login
- JWT authentication and role-based authorization
- Doctor search with filters (specialization, location, fee)
- Appointment booking, approval, rejection, completion, and cancellation
- Medical document upload per appointment
- In-app notification system
- Email alerts for appointment lifecycle events
- Admin doctor verification workflow
- Admin dashboard analytics
- Profile update (patient + doctor)
- Password change

### User Stories in Scope
- USN-1 through USN-19 (all sprint-committed stories)

---

## Testing Environment

| Field | Details |
|---|---|
| **Frontend URL** | `http://localhost:3000` |
| **Backend API URL** | `http://localhost:5000/api/v1` |
| **Health Check** | `http://localhost:5000/api/health` |
| **Database** | MongoDB (Local or Atlas Dev cluster) |
| **Credentials — Patient** | Email: `patient@test.com` / Password: `Test@1234` |
| **Credentials — Doctor** | Email: `doctor@test.com` / Password: `Test@1234` |
| **Credentials — Admin** | Email: `admin@medconsult.com` / Password: seeded via `seedAdmin.js` |

---

## Test Cases

| Test Case ID | Test Scenario | Test Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| **TC-001** | Patient OTP Registration | 1. Navigate to `/register` and select "Patient" role. 2. Enter name, email, and password. 3. Click "Send OTP". 4. Check email inbox. 5. Enter OTP. 6. Submit registration. | Account created; JWT stored in app context; redirected to `/patient/dashboard` | | |
| **TC-002** | OTP Expiry Validation | 1. Initiate OTP registration. 2. Wait 11 minutes. 3. Enter (expired) OTP. | Error message: "OTP expired or invalid". Registration not completed. | | |
| **TC-003** | Doctor Registration | 1. Navigate to `/register` and select "Doctor" role. 2. Fill all required fields (specialization, fee, hospital, experience). 3. Submit. | Doctor account created with `isVerified: false`; appears in admin pending list; NOT visible in patient search | | |
| **TC-004** | Patient Login with Email/Password | 1. Navigate to `/login`. 2. Enter valid patient credentials. 3. Click Login. | JWT stored; redirect to `/patient/dashboard`; name displayed in navbar | | |
| **TC-005** | Login with Invalid Credentials | 1. Navigate to `/login`. 2. Enter incorrect password. 3. Click Login. | Error: "Invalid email or password." No navigation. | | |
| **TC-006** | Google OAuth Login | 1. Click "Sign in with Google" on `/login`. 2. Select Google account from popup. | User created or retrieved by email; JWT stored; redirect to role-appropriate dashboard | | |
| **TC-007** | Role-Based Access Control | 1. Log in as a patient. 2. Manually navigate to `/doctor/dashboard`. | Redirected to `/unauthorized` page; no doctor data visible | | |
| **TC-008** | Doctor Search by Specialization | 1. Log in as patient. 2. Navigate to Doctor Search. 3. Enter "Cardiology" in specialization filter. 4. Click Search. | Only verified cardiologists displayed in results | | |
| **TC-009** | Doctor Search with Fee Filter | 1. Set minFee=300, maxFee=800. 2. Search. | Only doctors with consultation fee in ₹300–₹800 range shown | | |
| **TC-010** | Doctor Profile View | 1. From search results, click a doctor's name. 2. View profile page. | All fields displayed: name, specialization, fee, hospital, experience, availability timings | | |
| **TC-011** | Book Appointment | 1. On doctor profile, click "Book Appointment". 2. Select date and time slot. 3. Enter reason. 4. Submit. | Appointment created with `status: pending`; appears in "My Appointments" list; doctor receives email notification | | |
| **TC-012** | Duplicate Appointment Prevention | 1. Book an appointment with Doctor A for the same date/slot. 2. Try to book again with same slot. | Error: Slot already booked or conflict detected | | |
| **TC-013** | View My Appointments | 1. Navigate to `/patient/appointments`. | List of appointments displayed with status chips (Pending/Approved/Completed/Cancelled/Rejected) | | |
| **TC-014** | Cancel Pending Appointment | 1. Find a `pending` appointment. 2. Click "Cancel". 3. Confirm. | Appointment status → `cancelled`; doctor notified via email and in-app notification | | |
| **TC-015** | Cancel Non-Pending Appointment (Negative) | 1. Find an `approved` appointment. 2. Attempt to cancel. | Cancel button not shown or error: "Only pending appointments can be cancelled" | | |
| **TC-016** | Doctor Views Appointment Requests | 1. Log in as doctor. 2. Navigate to `/doctor/appointments`. | All incoming patient appointment requests shown with patient name, date, time, reason | | |
| **TC-017** | Doctor Approves Appointment | 1. Find a `pending` appointment in doctor dashboard. 2. Click "Approve". | Appointment status → `approved`; patient receives email + in-app notification | | |
| **TC-018** | Doctor Rejects Appointment | 1. Find a `pending` appointment. 2. Click "Reject". | Appointment status → `rejected`; patient receives rejection email + in-app notification | | |
| **TC-019** | Doctor Completes Appointment | 1. Find an `approved` appointment. 2. Click "Complete". | Appointment status → `completed`; patient notified; no further status changes possible | | |
| **TC-020** | Medical Document Upload | 1. Open an `approved` appointment. 2. Click "Upload Document". 3. Select a PDF file. 4. Submit. | File stored on server; `documents[]` array in appointment updated; download link visible | | |
| **TC-021** | Invalid File Type Upload (Negative) | 1. Attempt to upload a `.exe` or unsupported file type. | Error: "Invalid file type. Only PDF and images allowed." | | |
| **TC-022** | In-App Notification — Unread Count | 1. As patient, book an appointment. 2. Switch to doctor account. | Bell icon shows unread count badge of at least 1 | | |
| **TC-023** | Mark Notifications as Read | 1. Open notification panel. 2. Click "Mark All Read". | Unread count resets to 0; all notification items styled as read | | |
| **TC-024** | Admin Views Pending Doctors | 1. Log in as admin. 2. Navigate to `/admin/doctors`. 3. Filter by status: "Pending". | All unverified doctor registrations listed with action buttons | | |
| **TC-025** | Admin Approves Doctor | 1. Find a pending doctor. 2. Click "Approve". | Doctor `isVerified` → `true`; doctor now appears in patient search results | | |
| **TC-026** | Admin Rejects Doctor | 1. Find a pending doctor. 2. Click "Reject". | Doctor remains `isVerified: false`; does not appear in patient search | | |
| **TC-027** | Admin Dashboard Analytics | 1. Navigate to `/admin/dashboard`. | Stats displayed: Total Users, Total Doctors (verified vs. pending), Total Appointments by status | | |
| **TC-028** | Doctor Profile Update | 1. Log in as doctor. 2. Navigate to Profile. 3. Update consultation fee. 4. Save. | Fee updated in DB; reflected in patient search results immediately | | |
| **TC-029** | Doctor Update Availability Timings | 1. Navigate to doctor profile → Timings section. 2. Add Monday 9:00–17:00. 3. Save. | Timing saved; visible on doctor public profile | | |
| **TC-030** | Profile Photo Upload (Doctor) | 1. Navigate to doctor profile. 2. Click photo upload area. 3. Select an image. 4. Submit. | Photo stored in `/uploads/`; displayed in profile and appointment details | | |
| **TC-031** | Password Change | 1. Navigate to profile → Change Password. 2. Enter current and new password. 3. Submit. | Password updated in DB; new password required for next login | | |
| **TC-032** | Unauthorized API Access | 1. Make a direct HTTP request to `GET /api/v1/appointments/my` without JWT. | HTTP 401 with message: "No token provided. Authorization denied." | | |
| **TC-033** | Health Check Endpoint | 1. Navigate to or call `GET /api/health`. | HTTP 200 with JSON: `{ success: true, message: "Book-A-Doctor API is running", timestamp: "..." }` | | |
| **TC-034** | 404 — Unknown Route | 1. Navigate to an undefined API route e.g. `GET /api/v1/unknown`. | HTTP 404: "Cannot find GET /api/v1/unknown on this server." | | |

---

## Bug Tracking

| Bug ID | Bug Description | Steps to Reproduce | Severity | Status | Additional Feedback |
|---|---|---|---|---|---|
| **BG-001** | Google OAuth "Access Denied" on some accounts | 1. Click "Sign in with Google". 2. Select account not in GCP allowlist. | High | Closed | Fixed by adding correct redirect URIs in GCP Console + updating GOOGLE_CLIENT_ID in .env |
| **BG-002** | Appointment controller 500 error on approve | 1. Doctor clicks "Approve". 2. Server returns 500. | High | Closed | Root cause: unterminated JSDoc comment in appointment.controller.js. Fixed by correcting block comment syntax. |
| **BG-003** | CORS block from `localhost:5173` | 1. Frontend running on port 5173. 2. Any API call fails. | High | Closed | Fixed by adding `http://localhost:5173` to `CLIENT_ORIGIN` in backend `.env` |
| **BG-004** | Notification polling too frequent | 1. Open app. 2. Monitor Network tab. | Medium | Closed | Reduced polling interval from 5s to 30s in AppLayout component |
| **BG-005** | DoctorSearchPage data destructuring error | 1. Visit Doctor Search. 2. No doctors returned yet. | Medium | Closed | Fixed by adding default empty array fallback in response destructuring |
| **BG-006** | Profile photo 429 Too Many Requests | 1. Google OAuth user's profile image fetched from lh3.googleusercontent.com. | Low | Closed | Fixed by caching the image URL instead of re-fetching on every render |

---

## Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Tester / Developer | Shyam Prasad Mantri | 03 March 2025 | ✓ |
| Project Lead | | | |
| Faculty / Evaluator | | | |

---

## Notes
- All test cases should cover both positive (happy path) and negative (edge case) scenarios.
- Provide detailed feedback on any unexpected behavior not covered by existing bug entries.
- All `Pass` results require actual output to be documented in the "Actual Result" column.
- Obtain sign-off before final submission.

---

## References
- Project: `shyamprasad001/MedConsult`
- Backend API: `http://localhost:5000/api/v1`
- Frontend: `http://localhost:3000`
