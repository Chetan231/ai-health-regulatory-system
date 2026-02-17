import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Landing from './pages/common/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/common/Unauthorized';
import NotFound from './pages/common/NotFound';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientVitals from './pages/patient/Vitals';
import PatientTimeline from './pages/patient/Timeline';
import PatientProfile from './pages/patient/Profile';
import FindDoctors from './pages/patient/FindDoctors';
import PatientAppointments from './pages/patient/Appointments';
import PatientPrescriptions from './pages/patient/Prescriptions';
import AIHealth from './pages/patient/AIHealth';
import LabReports from './pages/patient/LabReports';
import PatientChat from './pages/patient/Chat';
import PatientBilling from './pages/patient/Billing';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorProfile from './pages/doctor/Profile';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import AIAssist from './pages/doctor/AIAssist';
import DoctorChat from './pages/doctor/Chat';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import DoctorVerification from './pages/admin/DoctorVerification';
import AdminDepartments from './pages/admin/Departments';
import AdminBeds from './pages/admin/Beds';

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const path = user.role === 'admin' ? '/admin/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    return <Navigate to={path} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="vitals" element={<PatientVitals />} />
        <Route path="timeline" element={<PatientTimeline />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="find-doctors" element={<FindDoctors />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="ai-health" element={<AIHealth />} />
        <Route path="lab-reports" element={<LabReports />} />
        <Route path="chat" element={<PatientChat />} />
        <Route path="billing" element={<PatientBilling />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="ai-assist" element={<AIAssist />} />
        <Route path="chat" element={<DoctorChat />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="doctors-verify" element={<DoctorVerification />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="beds" element={<AdminBeds />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
