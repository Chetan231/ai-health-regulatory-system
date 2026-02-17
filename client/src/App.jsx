import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';

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

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorProfile from './pages/doctor/Profile';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

// Admin Dashboard (placeholder)
import AdminDashboard from './pages/admin/Dashboard';

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
      {/* Public */}
      <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="vitals" element={<PatientVitals />} />
        <Route path="timeline" element={<PatientTimeline />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="find-doctors" element={<FindDoctors />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
