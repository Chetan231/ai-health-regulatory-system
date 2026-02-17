# AI Health Regulatory System — Complete Project Plan

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18 + Vite + Tailwind CSS + ShadCN UI |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| AI | OpenAI API (GPT-4) |
| Auth | JWT + bcrypt + Role-based middleware |
| Real-time | Socket.io (chat, notifications, vitals alerts) |
| Video | WebRTC via PeerJS / simple-peer |
| Payments | Razorpay (or Stripe) |
| Charts | Recharts |
| File Storage | Cloudinary |
| Email | Nodemailer + Gmail SMTP |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## Folder Structure

```
ai-health-regulatory-system/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                     # Axios instances & API calls
│   │   ├── assets/                  # Images, icons
│   │   ├── components/
│   │   │   ├── common/              # Button, Modal, Input, Loader, Navbar, Sidebar
│   │   │   ├── patient/             # Patient-specific components
│   │   │   ├── doctor/              # Doctor-specific components
│   │   │   ├── admin/               # Admin-specific components
│   │   │   ├── ai/                  # SymptomChecker, HealthTips, ReportSummary
│   │   │   ├── chat/                # ChatWindow, MessageBubble, VideoCall
│   │   │   └── charts/              # VitalsChart, AnalyticsChart
│   │   ├── contexts/                # AuthContext, SocketContext, ThemeContext
│   │   ├── hooks/                   # useAuth, useFetch, useSocket, useVitals
│   │   ├── layouts/                 # PatientLayout, DoctorLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/                # Login, Register, ForgotPassword
│   │   │   ├── patient/             # Dashboard, Appointments, Vitals, Reports, Chat, Billing, Profile
│   │   │   ├── doctor/              # Dashboard, Patients, Schedule, Consultations, Prescriptions, Chat, Profile
│   │   │   ├── admin/               # Dashboard, Doctors, Patients, Departments, Beds, Billing, Reports, Settings
│   │   │   └── common/              # Landing, NotFound, Unauthorized
│   │   ├── routes/                  # ProtectedRoute, RoleRoute, AppRoutes
│   │   ├── utils/                   # formatDate, validators, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Express Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── cloudinary.js            # Cloudinary config
│   │   ├── socket.js                # Socket.io setup
│   │   └── razorpay.js              # Payment gateway config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── prescriptionController.js
│   │   ├── vitalsController.js
│   │   ├── labReportController.js
│   │   ├── billingController.js
│   │   ├── chatController.js
│   │   ├── notificationController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── role.js                  # Role-based access
│   │   ├── errorHandler.js          # Global error handler
│   │   ├── upload.js                # Multer config
│   │   └── rateLimiter.js           # API rate limiting
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   ├── Vitals.js
│   │   ├── LabReport.js
│   │   ├── Billing.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Department.js
│   │   └── Bed.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── vitalsRoutes.js
│   │   ├── labReportRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── aiService.js             # OpenAI API integration
│   │   ├── emailService.js          # Nodemailer
│   │   └── paymentService.js        # Razorpay logic
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── apiResponse.js           # Standardized responses
│   │   └── constants.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── appointmentValidator.js
│   │   └── vitalsValidator.js
│   ├── .env
│   ├── server.js                    # Entry point
│   └── package.json
│
├── .gitignore
├── README.md
└── PROJECT_PLAN.md
```

---

## Database Schemas

### 1. User (Base — all roles)
```
{
  name: String (required)
  email: String (unique, required)
  password: String (hashed, required)
  role: Enum ['patient', 'doctor', 'admin'] (required)
  phone: String
  avatar: String (Cloudinary URL)
  isVerified: Boolean (default: false)
  resetPasswordToken: String
  resetPasswordExpiry: Date
  createdAt, updatedAt: timestamps
}
```

### 2. Patient (extends User via ref)
```
{
  userId: ObjectId → User (required)
  dateOfBirth: Date
  gender: Enum ['male', 'female', 'other']
  bloodGroup: Enum ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  height: Number (cm)
  weight: Number (kg)
  allergies: [String]
  chronicConditions: [String]
  emergencyContact: { name, phone, relation }
  address: { street, city, state, zip }
  insuranceInfo: { provider, policyNumber, validTill }
}
```

### 3. Doctor (extends User via ref)
```
{
  userId: ObjectId → User (required)
  specialization: String (required)
  qualification: String (required)
  experience: Number (years)
  licenseNumber: String (unique, required)
  departmentId: ObjectId → Department
  consultationFee: Number
  availability: [{
    day: Enum ['Mon'...'Sun'],
    startTime: String,
    endTime: String
  }]
  rating: Number (default: 0)
  totalReviews: Number (default: 0)
  isAvailable: Boolean (default: true)
}
```

### 4. Appointment
```
{
  patientId: ObjectId → User (required)
  doctorId: ObjectId → User (required)
  date: Date (required)
  timeSlot: String (required)
  type: Enum ['in-person', 'video'] (required)
  status: Enum ['pending', 'confirmed', 'completed', 'cancelled'] (default: 'pending')
  symptoms: String
  notes: String
  diagnosis: String
  followUpDate: Date
}
```

### 5. Prescription
```
{
  appointmentId: ObjectId → Appointment
  patientId: ObjectId → User (required)
  doctorId: ObjectId → User (required)
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }]
  notes: String
  isActive: Boolean (default: true)
}
```

### 6. Vitals
```
{
  patientId: ObjectId → User (required)
  bloodPressure: { systolic: Number, diastolic: Number }
  heartRate: Number (bpm)
  temperature: Number (°F)
  oxygenSaturation: Number (%)
  bloodSugar: { fasting: Number, postMeal: Number }
  bmi: Number
  weight: Number
  recordedAt: Date (default: now)
  recordedBy: Enum ['self', 'doctor', 'device']
  alerts: [{ type: String, message: String, severity: Enum ['low', 'medium', 'high', 'critical'] }]
}
```

### 7. LabReport
```
{
  patientId: ObjectId → User (required)
  doctorId: ObjectId → User
  title: String (required)
  type: Enum ['blood', 'urine', 'xray', 'mri', 'ct', 'ecg', 'other']
  fileUrl: String (Cloudinary)
  results: String
  aiSummary: String
  date: Date
  labName: String
  status: Enum ['pending', 'completed']
}
```

### 8. Billing
```
{
  patientId: ObjectId → User (required)
  appointmentId: ObjectId → Appointment
  items: [{ description: String, amount: Number }]
  totalAmount: Number
  discount: Number (default: 0)
  tax: Number
  finalAmount: Number
  paymentStatus: Enum ['pending', 'paid', 'failed', 'refunded'] (default: 'pending')
  paymentMethod: Enum ['razorpay', 'cash', 'insurance']
  razorpayOrderId: String
  razorpayPaymentId: String
  invoiceNumber: String (unique, auto-generated)
  paidAt: Date
}
```

### 9. Chat & Message
```
Chat:
{
  participants: [ObjectId → User] (exactly 2)
  lastMessage: ObjectId → Message
  updatedAt: Date
}

Message:
{
  chatId: ObjectId → Chat (required)
  sender: ObjectId → User (required)
  content: String
  type: Enum ['text', 'image', 'file']
  fileUrl: String
  isRead: Boolean (default: false)
}
```

### 10. Notification
```
{
  userId: ObjectId → User (required)
  title: String
  message: String
  type: Enum ['appointment', 'prescription', 'vitals_alert', 'payment', 'system']
  isRead: Boolean (default: false)
  link: String
}
```

### 11. Department
```
{
  name: String (required, unique)
  description: String
  headDoctorId: ObjectId → User
  isActive: Boolean (default: true)
}
```

### 12. Bed
```
{
  bedNumber: String (unique, required)
  departmentId: ObjectId → Department
  type: Enum ['general', 'icu', 'private', 'semi-private']
  status: Enum ['available', 'occupied', 'maintenance'] (default: 'available')
  patientId: ObjectId → User (null when available)
  admittedAt: Date
}
```

---

## API Routes

### Auth (`/api/auth`)
```
POST   /register              # Register (patient/doctor)
POST   /login                 # Login → JWT
POST   /forgot-password       # Send reset email
POST   /reset-password/:token # Reset password
GET    /me                    # Get current user profile
PUT    /update-profile        # Update profile + avatar
```

### Patient (`/api/patients`)
```
GET    /dashboard             # Dashboard stats
GET    /profile               # Full patient profile
PUT    /profile               # Update health info
GET    /health-timeline       # Complete health history
```

### Doctor (`/api/doctors`)
```
GET    /dashboard             # Dashboard stats
GET    /                      # List all doctors (public, with filters)
GET    /:id                   # Doctor profile
GET    /my-patients           # Doctor's patient list
PUT    /availability          # Update schedule
```

### Admin (`/api/admin`)
```
GET    /dashboard             # System-wide analytics
GET    /users                 # All users with filters
PUT    /users/:id/status      # Activate/deactivate user
GET    /doctors/pending       # Unverified doctors
PUT    /doctors/:id/verify    # Verify doctor
```

### Appointments (`/api/appointments`)
```
POST   /                      # Book appointment
GET    /                      # List (filtered by role)
GET    /:id                   # Appointment detail
PUT    /:id/status            # Update status (confirm/cancel/complete)
GET    /slots/:doctorId/:date # Available slots
```

### Prescriptions (`/api/prescriptions`)
```
POST   /                      # Create (doctor only)
GET    /                      # List (by role)
GET    /:id                   # Detail
PUT    /:id                   # Update
GET    /:id/download          # PDF download
```

### Vitals (`/api/vitals`)
```
POST   /                      # Record vitals
GET    /                      # History (with date range)
GET    /latest                # Latest reading
GET    /analytics             # Trends & charts data
```

### Lab Reports (`/api/lab-reports`)
```
POST   /                      # Upload report
GET    /                      # List
GET    /:id                   # Detail + AI summary
POST   /:id/ai-summary       # Generate AI summary
```

### Billing (`/api/billing`)
```
POST   /                      # Create invoice
GET    /                      # List invoices
GET    /:id                   # Invoice detail
POST   /create-order          # Razorpay order
POST   /verify-payment        # Verify Razorpay payment
GET    /:id/download          # PDF invoice
```

### Chat (`/api/chat`)
```
POST   /                      # Create/get chat
GET    /                      # My chats
GET    /:chatId/messages      # Messages in chat
POST   /:chatId/messages      # Send message (REST fallback)
```

### Notifications (`/api/notifications`)
```
GET    /                      # My notifications
PUT    /:id/read              # Mark as read
PUT    /read-all              # Mark all read
DELETE /:id                   # Delete
```

### AI (`/api/ai`)
```
POST   /symptom-check         # Analyze symptoms → possible conditions
POST   /health-tips           # Personalized health recommendations
POST   /report-summary        # Summarize lab report
POST   /risk-assessment       # Predict health risks from vitals history
```

### Admin Resources
```
# Departments (/api/departments)
CRUD operations

# Beds (/api/beds)
CRUD + status management
GET    /stats                  # Bed availability stats
```

---

## Socket.io Events

```
# Connection
connect / disconnect

# Chat
join_chat(chatId)
send_message({ chatId, content, type })
receive_message → broadcast to room
typing / stop_typing

# Video Call
call_user({ to, signalData })
answer_call({ to, signalData })
end_call({ to })
call_rejected({ to })

# Notifications
new_notification → push to specific user

# Vitals Alert
vitals_alert → push to patient + assigned doctor
```

---

## Sprint Breakdown (8 Sprints, ~4 weeks)

### Sprint 1: Foundation (Days 1-3)
- [ ] Project setup (Vite + Express + MongoDB)
- [ ] Folder structure
- [ ] DB connection, env config
- [ ] User model + Auth (register/login/JWT)
- [ ] Auth middleware + role middleware
- [ ] Landing page + Auth pages (Login/Register)
- [ ] AuthContext + Protected Routes

### Sprint 2: Patient Module (Days 4-6)
- [ ] Patient model + profile CRUD
- [ ] Patient dashboard page
- [ ] Vitals model + CRUD + charts
- [ ] Health timeline
- [ ] Patient layout + sidebar navigation

### Sprint 3: Doctor Module (Days 7-9)
- [ ] Doctor model + profile + availability
- [ ] Doctor dashboard
- [ ] Patient list + patient detail view
- [ ] Doctor search/filter (public)
- [ ] Doctor layout + navigation

### Sprint 4: Appointments & Prescriptions (Days 10-12)
- [ ] Appointment model + booking flow
- [ ] Slot availability logic
- [ ] Appointment management (confirm/cancel/complete)
- [ ] Prescription model + create/view
- [ ] PDF generation for prescriptions

### Sprint 5: Admin Module (Days 13-15)
- [ ] Admin dashboard with analytics
- [ ] User management (list/activate/deactivate)
- [ ] Doctor verification flow
- [ ] Department + Bed management
- [ ] System-wide reports

### Sprint 6: AI Integration (Days 16-18)
- [ ] OpenAI service setup
- [ ] Symptom checker (patient-facing)
- [ ] AI diagnosis suggestions (doctor-facing)
- [ ] Lab report AI summarization
- [ ] Health risk assessment from vitals
- [ ] Personalized health tips

### Sprint 7: Real-time + Payments (Days 19-21)
- [ ] Socket.io setup
- [ ] Real-time chat (doctor ↔ patient)
- [ ] Video call via WebRTC
- [ ] Notification system (in-app + email)
- [ ] Razorpay integration
- [ ] Billing + invoice generation

### Sprint 8: Polish & Deploy (Days 22-25)
- [ ] Responsive design pass
- [ ] Error handling + loading states
- [ ] Rate limiting + security headers
- [ ] Testing critical flows
- [ ] Deploy frontend (Vercel)
- [ ] Deploy backend (Render)
- [ ] MongoDB Atlas production cluster
- [ ] README + documentation

---

## Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=
```

---

_Plan complete. Ready for Phase 3: Execute._
