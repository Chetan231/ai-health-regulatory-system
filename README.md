# 🏥 AI Health Regulatory System

A comprehensive AI-powered health monitoring and hospital management platform built with the MERN stack. Designed for **Patients**, **Doctors**, and **Hospital Admins** — featuring real-time communication, AI diagnostics, and complete patient health tracking from A to Z.

> 🎓 **Capstone Project** — Built using the APE Model (Analyze → Plan → Execute)

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![AI Powered](https://img.shields.io/badge/AI-OpenAI%20GPT--4-blue) ![Real-time](https://img.shields.io/badge/Real--time-Socket.io-yellow) ![Payments](https://img.shields.io/badge/Payments-Razorpay-orange)

---

## 🚀 Features

### 👤 Patient Portal
- **Dashboard** — Health overview with stat cards, latest vitals, alerts, quick actions
- **Vitals Monitoring** — Record BP, heart rate, SpO₂, temperature, blood sugar, weight with **auto-generated health alerts**
- **Health Timeline** — Chronological view of all health events grouped by date
- **Appointments** — Book appointments with available doctors, slot selection, video/in-person
- **Prescriptions** — View digital prescriptions with medicine tables
- **AI Health Assistant** — Symptom checker, health risk assessment, personalized health tips
- **Lab Reports** — Upload reports and get **AI-powered summaries**
- **Find Doctors** — Search by specialization, sort by rating/experience/fee
- **Real-time Chat** — Instant messaging with doctors via Socket.io
- **Billing & Payments** — View invoices and pay via Razorpay

### 👨‍⚕️ Doctor Portal
- **Dashboard** — Today's appointments, patient count, schedule overview
- **Patient Management** — Searchable list with split-panel detail view (vitals, allergies, conditions)
- **Schedule Management** — Set weekly availability with time slots
- **Appointments** — Confirm/decline pending, mark complete with diagnosis
- **Prescriptions** — Create digital prescriptions with multiple medicines
- **AI Diagnosis Assistant** — AI-powered differential diagnosis, suggested tests, treatment options
- **Real-time Chat** — Communicate with patients instantly

### 🏢 Admin Portal
- **Analytics Dashboard** — Hospital-wide stats with pie charts, recent activity
- **User Management** — View/search/filter all users, activate/deactivate, delete
- **Doctor Verification** — Review and verify new doctor registrations
- **Department Management** — CRUD for hospital departments
- **Bed Management** — Track bed availability with stats, filter by department/status/type

### 🤖 AI Features (OpenAI Integration)
| Feature | Description |
|---|---|
| Symptom Checker | Patient describes symptoms → AI suggests conditions with probability |
| Diagnosis Assist | Doctor inputs symptoms → differential diagnosis, tests, red flags |
| Lab Report Summarizer | Upload report → AI generates plain-language summary |
| Health Risk Assessment | Analyze vitals history → predict health risks |
| Personalized Health Tips | AI-generated daily health recommendations |

> Works in **demo mode** without an OpenAI API key (realistic simulated responses)

### ⚡ Real-time Features
- **Socket.io** chat with typing indicators
- **WebRTC** video call signaling (call/answer/end/reject)
- **Push notifications** via socket
- **Auto-generated vitals alerts** (BP, HR, SpO₂, temperature, blood sugar thresholds)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| AI | OpenAI GPT-4o-mini (with demo fallback) |
| Real-time | Socket.io |
| Video Calls | WebRTC signaling via Socket.io |
| Payments | Razorpay (with demo mode) |
| Charts | Recharts |
| Auth | JWT + bcrypt + Role-based middleware |
| Security | Helmet + CORS + Rate Limiting |

---

## 📁 Project Structure

```
ai-health-regulatory-system/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # Axios API calls (8 modules)
│   │   ├── components/common/  # Shared UI components
│   │   ├── contexts/           # AuthContext, SocketContext
│   │   ├── layouts/            # Patient, Doctor, Admin layouts
│   │   ├── pages/              # All pages organized by role
│   │   ├── routes/             # ProtectedRoute with role check
│   │   └── App.jsx             # Main routing
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/                 # DB, Socket.io, Cloudinary
│   ├── controllers/            # 10 controllers
│   ├── middleware/              # Auth, Role, Error, Rate Limit
│   ├── models/                 # 12 Mongoose models
│   ├── routes/                 # 12 route files
│   ├── services/               # AI service (OpenAI)
│   ├── validators/             # Express-validator rules
│   ├── seed.js                 # Database seeder
│   └── server.js               # Entry point
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ai-health-regulatory-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ai-health-system
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional — works without these (demo mode)
OPENAI_API_KEY=sk-...
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
```

### 3. Seed the Database
```bash
npm run seed
```

This creates sample data with login credentials:
| Role | Email | Password |
|---|---|---|
| Admin | admin@healthai.com | password123 |
| Doctor | dr.rajesh@healthai.com | password123 |
| Doctor | dr.priya@healthai.com | password123 |
| Patient | chetan@healthai.com | password123 |
| Patient | ananya@healthai.com | password123 |

### 4. Frontend Setup
```bash
cd ../client
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_...
```

### 5. Run the Application
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open **http://localhost:5173** 🚀

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd client
npx vercel --prod
```
Set environment variables in Vercel dashboard.

### Backend → Render
1. Create a new Web Service on [render.com](https://render.com)
2. Connect your Git repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `MONGO_URI` in backend `.env`

---

## 📊 Database Models (12)

`User` · `Patient` · `Doctor` · `Appointment` · `Prescription` · `Vitals` · `LabReport` · `Billing` · `Chat` · `Message` · `Notification` · `Department` · `Bed`

## 🔌 API Endpoints (50+)

| Group | Endpoints |
|---|---|
| Auth | Register, Login, GetMe, UpdateProfile |
| Patient | Dashboard, Profile CRUD, Health Timeline |
| Doctor | Dashboard, Profile, Availability, Patient List/Detail |
| Appointments | Book, List, Status Updates, Available Slots |
| Prescriptions | CRUD with role-based access |
| Vitals | Record, History, Latest, Analytics, Delete |
| Lab Reports | Create, List, Detail |
| AI | Symptom Check, Diagnosis Assist, Report Summary, Risk Assessment, Health Tips |
| Chat | Create, List, Messages, Send |
| Notifications | List, Read, Read All, Delete |
| Billing | Create Invoice, List, Pay (Razorpay), Verify |
| Admin | Dashboard, Users CRUD, Doctor Verify, Departments, Beds |

---

## 🎨 Design System

| Role | Theme Color | Accent |
|---|---|---|
| Patient | 💙 Blue (#2563eb) | Soft blue backgrounds |
| Doctor | 💚 Emerald (#059669) | Green accents |
| Admin | 💜 Violet (#7c3aed) | Purple accents |

All pages are **fully responsive** with mobile sidebar navigation.

---

## 🔒 Security

- JWT authentication with HTTP-only option
- bcrypt password hashing (12 rounds)
- Role-based access control (patient/doctor/admin)
- Express rate limiting (100 req/15min API, 20 req/15min auth)
- Helmet security headers
- CORS configuration
- Input validation (express-validator)
- MongoDB injection prevention (Mongoose)
- Socket.io JWT authentication

---

## 📝 APE Model Documentation

### Analyze
- Identified 3 user roles (Patient, Doctor, Admin)
- Mapped 12 core modules covering A-Z health monitoring
- Defined tech stack and architecture

### Plan
- Designed 12 database schemas with relationships
- Planned 50+ API endpoints across 12 route groups
- Created 8-sprint development roadmap

### Execute
- Sprint 1: Foundation + Auth
- Sprint 2: Patient Module (vitals, timeline, profile)
- Sprint 3: Doctor Module (patients, schedule, search)
- Sprint 4: Appointments & Prescriptions
- Sprint 5: Admin Module (analytics, users, departments, beds)
- Sprint 6: AI Integration (5 AI features)
- Sprint 7: Real-time Chat + Video + Payments
- Sprint 8: Polish & Deploy

---

## 📄 License

This project is built for educational/capstone purposes.

---

**Built with ❤️ using MERN Stack + AI**
