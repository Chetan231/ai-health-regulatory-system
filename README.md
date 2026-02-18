# 🏥 AI Health Regulatory System

A complete AI-powered health monitoring system built with the MERN stack. Fully animated UI with Framer Motion.

## 🎯 Features

### Patient Portal
- 📊 Health Dashboard with animated score ring
- 📅 Book Appointments (3-step animated wizard)
- 🧪 Medical Reports (12+ types with AI analysis)
- 💊 Prescriptions with medication details
- 📈 Vitals Monitoring with trend charts (Recharts)
- 💰 Billing & Invoice management
- 🤖 AI Health Assistant (Symptom Checker + Risk Assessment)
- 👤 Health Profile management

### Doctor Portal
- 📋 Dashboard with today's schedule
- 👥 Patient management
- 📅 Appointment management (confirm/complete/cancel)
- 🧪 Create medical reports with test results
- 💊 Write prescriptions

### Admin Portal
- 📊 Analytics dashboard with charts (Bar, Pie, Area)
- 👨‍⚕️ Doctor management (approve/reject)
- 🏥 Department CRUD
- 👥 Patient overview
- 💰 Revenue analytics

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.io |
| Charts | Recharts |
| AI | OpenAI API (mock-ready) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

### Installation

```bash
# Clone
git clone <repo-url>
cd ai-health-regulatory-system

# Install server deps
cd server
npm install
cp .env.example .env  # Edit with your MongoDB URI

# Seed database (demo data)
npm run seed

# Start server
npm run dev

# In new terminal - Install client deps
cd ../client
npm install

# Start client
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@health.com | admin123 |
| Doctor | sarah@health.com | doctor123 |
| Doctor | john@health.com | doctor123 |
| Doctor | emily@health.com | doctor123 |
| Patient | rahul@test.com | patient123 |
| Patient | priya@test.com | patient123 |
| Patient | amit@test.com | patient123 |

## 📁 Project Structure

```
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable animated components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # All pages (patient/doctor/admin)
│   │   ├── routes/        # Protected routes
│   │   └── services/      # API service
│   └── ...
│
├── server/                # Express Backend
│   ├── config/            # DB config
│   ├── controllers/       # 8 controllers
│   ├── middleware/         # Auth, upload, error handling
│   ├── models/            # 10 Mongoose models
│   ├── routes/            # 10 route files
│   ├── seeds/             # Demo data seeder
│   └── utils/             # Token, AI helper
│
└── PROJECT.md             # Full project plan
```

## 🎨 Animation Features

- ✨ Page transitions (fade + slide)
- 🃏 Card hover effects (lift + scale)
- 📊 Animated charts with gradient fills
- 🔵 Health score ring (SVG stroke animation)
- 💫 Staggered list animations
- 🌊 Floating background blobs
- 🎯 Spring-animated sidebar active indicator
- 🔘 Button micro-interactions
- 📝 Input focus glow effects
- ⏳ Custom loading spinners
- 🎪 Modal animations with backdrop blur
- 📈 CountUp number animations
- 🏷️ Tag/badge scale animations

## 📊 API Endpoints (50+)

- `/api/auth` — Register, Login, Profile
- `/api/patients` — Profile, Dashboard
- `/api/doctors` — List, Detail, My Patients
- `/api/appointments` — CRUD, Available Slots
- `/api/reports` — CRUD, File Upload
- `/api/prescriptions` — CRUD
- `/api/vitals` — Record, Trends
- `/api/ai` — Symptom Check, Report Summary, Risk
- `/api/billing` — Invoices CRUD
- `/api/admin` — Dashboard, Doctors, Departments, Patients
- `/api/notifications` — List, Mark Read

---

Built with ❤️ using the APE Model (Analyze → Plan → Execute)
