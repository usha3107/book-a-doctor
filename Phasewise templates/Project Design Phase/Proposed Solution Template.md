# Project Design Phase — Proposed Solution

**Date:** 15 February 2025  
**Team ID:** MERN-MED-01  
**Project Name:** MedConsult – Book a Doctor (Telemedicine Platform)  
**Maximum Marks:** 2 Marks

---

## Proposed Solution Template

| S.No. | Parameter | Description |
|---|---|---|
| **1.** | **Problem Statement (Problem to be solved)** | Patients in India and similar markets struggle to discover, compare, and book verified specialist doctors without navigating fragmented, opaque, and time-consuming manual systems (hospital calls, walk-ins, or unverified online listings). Simultaneously, doctors lack a professional digital tool to manage their consultation schedule, patient communications, and medical document exchange. Platform administrators have no centralized governance layer to verify doctors and monitor appointment flows. |
| **2.** | **Idea / Solution Description** | **MedConsult** is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) telemedicine platform that enables patients to search verified doctors by specialization, location, and fee; book appointments in real-time; upload medical documents; and receive live status updates. Doctors get a dedicated dashboard to manage their availability, approve or reject bookings, and track consultation history. Admins govern the platform via a comprehensive dashboard for user/doctor/appointment management. |
| **3.** | **Novelty / Uniqueness** | • **OTP-Verified Onboarding**: New patients validate their email via a time-limited OTP before completing registration — reducing fake accounts. <br> • **Role-Based JWT Authorization**: Three distinct user roles (patient, doctor, admin) with middleware-enforced access control — each sees only their own data. <br> • **Appointment Lifecycle State Machine**: A structured booking → pending → approved/rejected → completed/cancelled flow with email + in-app notifications at each transition. <br> • **Medical Document Upload per Appointment**: Patients can attach medical files (PDFs, images) directly to a specific appointment — a structured, traceable medical record chain. <br> • **Admin-Gated Doctor Listing**: Doctors are unlisted until an admin approves their credentials — ensuring only verified practitioners appear in search results. |
| **4.** | **Social Impact / Customer Satisfaction** | • **Healthcare Democratization**: Patients in Tier-2 and Tier-3 cities can access specialists they previously had to travel hundreds of kilometers to consult. <br> • **Reduced No-Shows**: Real-time notifications and digital confirmation reduce appointment abandonment. <br> • **Patient Empowerment**: Transparent doctor profiles (specialization, fee, timings, hospital) allow informed decision-making before booking. <br> • **Doctor Efficiency**: Doctors eliminate manual phone and WhatsApp scheduling — freeing time for actual patient care. <br> • **Trust Through Verification**: Admin-verified doctor listings increase platform credibility and patient confidence. |
| **5.** | **Business Model (Revenue Model)** | • **Commission per Appointment**: MedConsult charges a small platform fee (e.g., 5–10%) per successfully completed consultation. <br> • **Doctor Subscription Plans**: Premium monthly/annual plans for doctors offering enhanced profile visibility, priority listing, and appointment analytics. <br> • **Freemium for Patients**: Basic search and booking is free; premium features (e.g., priority appointment, health record vault) available on subscription. <br> • **Healthcare Institution Partnerships**: White-label licensing to hospitals and clinics for branded deployment of the platform. <br> • **Health Insurance Integration** (future): Commission-based referrals from insurance providers for covered consultations. |
| **6.** | **Scalability of the Solution** | • **Horizontal Scalability**: The stateless Express.js REST API can be load-balanced across multiple Node.js instances. JWT-based auth eliminates server-side session storage. <br> • **MongoDB Atlas Auto-Scaling**: Document-oriented MongoDB schema accommodates flexible healthcare data structures and can scale horizontally with sharding. <br> • **Modular Microservices-Ready Architecture**: Controllers, routes, and middleware are separated by domain (auth, appointments, doctors, admin, notifications) — enabling extraction into microservices as load grows. <br> • **CDN-Ready File Storage**: Uploaded medical documents currently stored via Multer on local disk; production-ready to migrate to AWS S3 or Cloudinary with minimal code change. <br> • **Future Additions**: Real-time WebSocket notifications, video consultation (WebRTC), AI-based symptom checker, multi-language support (i18n), and mobile app (React Native). |

---

## Technology Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React.js 18, Material UI v5, React Router v6, Axios, Styled Components |
| Backend | Node.js, Express.js 4.x, express-async-errors, Helmet, CORS |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens), bcryptjs, Nodemailer (OTP), @react-oauth/google |
| File Upload | Multer (local disk), ready for S3/Cloudinary |
| Notifications | Nodemailer (email) + custom in-app notification model |
| Deployment | Local development; production-ready for any cloud (Render, Railway, Vercel) |

---

## Project Repository
- **GitHub**: `shyamprasad001/MedConsult`
- **Stack**: MERN (MongoDB, Express, React, Node.js)
