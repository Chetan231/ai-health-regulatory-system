import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/common/Layout';
import FloatingNotifications from './components/common/FloatingNotifications';

// Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Shared
import VideoCall from './pages/VideoCall';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import Appointments from './pages/patient/Appointments';
import BookAppointment from './pages/patient/BookAppointment';
import Reports from './pages/patient/Reports';
import Prescriptions from './pages/patient/Prescriptions';
import Vitals from './pages/patient/Vitals';
import Billing from './pages/patient/Billing';
import AIHealth from './pages/patient/AIHealth';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorReports from './pages/doctor/DoctorReports';
import CreateReport from './pages/doctor/CreateReport';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import CreatePrescription from './pages/doctor/CreatePrescription';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManagePatients from './pages/admin/ManagePatients';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const RedirectByRole = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
          }}
        />
        <FloatingNotifications />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<RedirectByRole />} />

            {/* Video Call (shared - both patient & doctor) */}
            <Route path="/video-call/:appointmentId" element={
              <ProtectedRoute roles={['patient', 'doctor']}>
                <VideoCall />
              </ProtectedRoute>
            } />

            {/* Patient */}
            <Route path="/patient" element={
              <ProtectedRoute roles={['patient']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/book" element={<BookAppointment />} />
              <Route path="reports" element={<Reports />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="vitals" element={<Vitals />} />
              <Route path="billing" element={<Billing />} />
              <Route path="ai-health" element={<AIHealth />} />
            </Route>

            {/* Doctor */}
            <Route path="/doctor" element={
              <ProtectedRoute roles={['doctor']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="reports" element={<DoctorReports />} />
              <Route path="reports/create" element={<CreateReport />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
              <Route path="prescriptions/create" element={<CreatePrescription />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="patients" element={<ManagePatients />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
