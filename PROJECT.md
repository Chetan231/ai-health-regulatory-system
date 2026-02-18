# AI Health Regulatory System — Project Plan

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **AI:** OpenAI API (mock-ready)
- **File Upload:** Multer (local) + Cloudinary (optional)
- **Charts:** Recharts
- **PDF:** jsPDF
- **Notifications:** Nodemailer (email) + Socket.io (real-time)

---

## Folder Structure

```
ai-health-regulatory-system/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/         # Button, Modal, Loader, Sidebar, Navbar
│   │   │   ├── auth/           # Login, Register, ForgotPassword
│   │   │   ├── patient/        # Dashboard, Profile, Reports, Appointments
│   │   │   ├── doctor/         # Dashboard, Patients, Prescriptions, Schedule
│   │   │   └── admin/          # Dashboard, Doctors, Departments, Analytics
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── hooks/              # useAuth, useFetch, useSocket
│   │   ├── pages/
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── patient/        # PatientDashboard, MyReports, BookAppointment
│   │   │   ├── doctor/         # DoctorDashboard, PatientList, WriteReport
│   │   │   └── admin/          # AdminDashboard, ManageDoctors, Analytics
│   │   ├── services/           # api.js (axios instance), auth.js, patient.js, doctor.js
│   │   ├── utils/              # formatDate, validators, constants
│   │   ├── routes/             # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary config
│   │   └── env.js              # Environment variables
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── reportController.js
│   │   ├── prescriptionController.js
│   │   ├── vitalController.js
│   │   ├── billingController.js
│   │   ├── aiController.js
│   │   └── notificationController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Report.js
│   │   ├── Prescription.js
│   │   ├── Vital.js
│   │   ├── Invoice.js
│   │   ├── Department.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── vitalRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── aiRoutes.js
│   │   └── notificationRoutes.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── roleCheck.js        # Role-based access
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── upload.js           # Multer config
│   │   └── validate.js         # Request validation
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   ├── aiHelper.js         # OpenAI integration
│   │   └── pdfGenerator.js
│   ├── seeds/
│   │   └── seed.js             # Demo data
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── PROJECT.md
```

---

## Database Schemas

### User
```
{
  name, email, password, role: [patient|doctor|admin],
  phone, avatar, isVerified, createdAt
}
```

### Patient (extends User ref)
```
{
  userId (ref), dateOfBirth, gender, bloodGroup,
  allergies: [String], chronicConditions: [String],
  emergencyContact: { name, phone, relation },
  insuranceInfo: { provider, policyNumber }
}
```

### Doctor (extends User ref)
```
{
  userId (ref), specialization, licenseNumber,
  department (ref), experience (years),
  availability: [{ day, startTime, endTime }],
  rating, consultationFee
}
```

### Appointment
```
{
  patient (ref), doctor (ref),
  date, timeSlot, type: [in-person|online],
  status: [pending|confirmed|completed|cancelled],
  symptoms, notes, createdAt
}
```

### Report
```
{
  patient (ref), doctor (ref), appointment (ref),
  type: [blood-test|urine-test|imaging|ecg|lipid-panel|cbc|thyroid|liver|kidney|other],
  title, description,
  results: [{ parameter, value, unit, normalRange, status: [normal|low|high|critical] }],
  files: [{ url, filename }],
  aiSummary, date, createdAt
}
```

### Prescription
```
{
  patient (ref), doctor (ref), appointment (ref),
  medications: [{ name, dosage, frequency, duration, instructions }],
  diagnosis, notes, date, createdAt
}
```

### Vital
```
{
  patient (ref),
  type: [blood-pressure|heart-rate|glucose|temperature|weight|bmi|oxygen],
  value, unit, recordedAt, notes
}
```

### Invoice
```
{
  patient (ref), doctor (ref), appointment (ref),
  items: [{ description, amount }],
  total, status: [pending|paid|overdue],
  dueDate, paidAt, createdAt
}
```

### Department
```
{
  name, description, headDoctor (ref), isActive, createdAt
}
```

### Notification
```
{
  user (ref), title, message,
  type: [appointment|report|prescription|billing|system],
  isRead, createdAt
}
```

---

## API Routes

### Auth — `/api/auth`
- POST `/register` — Register (patient/doctor)
- POST `/login` — Login → JWT
- POST `/forgot-password` — Send reset email
- POST `/reset-password/:token` — Reset password
- GET `/me` — Get current user

### Patient — `/api/patients`
- GET `/profile` — Get patient profile
- PUT `/profile` — Update profile
- GET `/dashboard` — Dashboard stats
- GET `/health-summary` — AI-generated health summary

### Doctor — `/api/doctors`
- GET `/` — List all doctors (filterable)
- GET `/:id` — Doctor detail
- PUT `/profile` — Update profile
- GET `/my-patients` — Doctor's patient list
- GET `/dashboard` — Dashboard stats

### Appointments — `/api/appointments`
- POST `/` — Book appointment
- GET `/` — List (filtered by role)
- GET `/:id` — Detail
- PUT `/:id` — Update status
- DELETE `/:id` — Cancel

### Reports — `/api/reports`
- POST `/` — Create report (doctor)
- GET `/` — List reports (by patient/doctor)
- GET `/:id` — Detail
- POST `/:id/upload` — Upload file
- GET `/:id/pdf` — Download PDF
- POST `/:id/ai-analyze` — AI analysis

### Prescriptions — `/api/prescriptions`
- POST `/` — Create (doctor)
- GET `/` — List
- GET `/:id` — Detail
- GET `/:id/pdf` — Download PDF

### Vitals — `/api/vitals`
- POST `/` — Record vital
- GET `/` — List (with date range filter)
- GET `/trends` — Trends data for charts

### Billing — `/api/billing`
- POST `/` — Create invoice
- GET `/` — List invoices
- PUT `/:id` — Update status
- GET `/:id/pdf` — Download PDF

### Admin — `/api/admin`
- GET `/dashboard` — Analytics
- GET `/doctors` — Manage doctors
- PUT `/doctors/:id/verify` — Verify doctor
- CRUD `/departments` — Department management
- GET `/reports/analytics` — System-wide analytics

### AI — `/api/ai`
- POST `/symptom-check` — Analyze symptoms
- POST `/report-summary` — Summarize report
- POST `/health-risk` — Risk prediction

### Notifications — `/api/notifications`
- GET `/` — User notifications
- PUT `/:id/read` — Mark read
- PUT `/read-all` — Mark all read

---

## Build Order (Step by Step)

### Step 1 — Project Setup
Initialize both client (Vite+React) and server (Express), install deps, configure env

### Step 2 — Database & Models
MongoDB connection, all Mongoose schemas

### Step 3 — Auth System
Register, login, JWT middleware, role middleware, protected routes

### Step 4 — Frontend Auth
Login/Register pages, AuthContext, ProtectedRoute, layout/navbar

### Step 5 — Patient Module
Profile, dashboard, health summary

### Step 6 — Doctor Module
Profile, patient list, dashboard

### Step 7 — Appointment System
Booking, scheduling, status management (both frontend + backend)

### Step 8 — Medical Reports
CRUD, file upload, PDF generation, report types

### Step 9 — Prescriptions
Create, view, PDF download

### Step 10 — Vitals Monitoring
Record vitals, trend charts (Recharts)

### Step 11 — AI Features
Symptom checker, report summarization, risk prediction

### Step 12 — Billing
Invoice creation, payment tracking, PDF

### Step 13 — Admin Dashboard
Analytics, doctor management, department management

### Step 14 — Notifications
Real-time (Socket.io) + email notifications

### Step 15 — Polish
Responsive design, error handling, loading states, seed data, README

---
