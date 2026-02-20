import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import Loader from '../../components/common/Loader';
import { FiUsers, FiCalendar, FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiVideo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const statusColors = {
  completed: 'bg-success/20 text-success',
  confirmed: 'bg-primary/20 text-primary',
  pending: 'bg-warning/20 text-warning',
  cancelled: 'bg-danger/20 text-danger',
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, pendingReports: 0, completedToday: 0 });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, appointmentsRes] = await Promise.allSettled([
        api.get('/doctors/dashboard/stats'),
        api.get('/appointments?limit=20'),
      ]);

      if (dashRes.status === 'fulfilled') {
        setStats(dashRes.value.data.stats || {});
        setTodaySchedule(dashRes.value.data.todaySchedule || []);
      }

      if (appointmentsRes.status === 'fulfilled') {
        const allApts = appointmentsRes.value.data.appointments || [];
        
        // If dashboard/stats endpoint failed, calculate from appointments
        if (dashRes.status !== 'fulfilled') {
          const today = dayjs().startOf('day');
          const todayApts = allApts.filter(a => dayjs(a.date).isSame(today, 'day'));
          const uniquePatients = new Set(allApts.map(a => a.patient?._id).filter(Boolean));
          
          setStats({
            totalPatients: uniquePatients.size,
            todayAppointments: todayApts.length,
            pendingReports: 0,
            completedToday: todayApts.filter(a => a.status === 'completed').length,
          });

          setTodaySchedule(todayApts.sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || '')));
        }

        // Recent appointments (upcoming + recent past)
        setRecentAppointments(allApts.slice(0, 10));
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const upcomingCount = recentAppointments.filter(a => 
    a.status !== 'cancelled' && a.status !== 'completed' && dayjs(a.date).isAfter(dayjs())
  ).length;

  const statsData = [
    { icon: FiUsers, label: 'Total Patients', value: stats.totalPatients || 0, color: 'primary', link: '/doctor/patients' },
    { icon: FiCalendar, label: "Today's Appointments", value: stats.todayAppointments || 0, color: 'success', link: '/doctor/appointments' },
    { icon: FiFileText, label: 'Pending Reports', value: stats.pendingReports || 0, color: 'warning', link: '/doctor/reports' },
    { icon: FiCheckCircle, label: 'Completed Today', value: stats.completedToday || 0, color: 'accent' },
  ];

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {getGreeting()}, <span className="gradient-text">Dr. {user?.name}</span> 🩺
        </h1>
        <p className="text-gray-400 mt-1">
          {stats.todayAppointments > 0
            ? `You have ${stats.todayAppointments} appointment${stats.todayAppointments > 1 ? 's' : ''} today.`
            : 'No appointments scheduled for today.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsData.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-light rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
            <Link to="/doctor/appointments" className="text-xs text-primary hover:underline">View All →</Link>
          </div>

          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((apt, i) => (
                <motion.div
                  key={apt._id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-white text-sm font-bold"
                    >
                      {apt.patient?.name?.[0]?.toUpperCase() || 'P'}
                    </motion.div>
                    <div>
                      <p className="text-sm text-white font-medium">{apt.patient?.name || 'Patient'}</p>
                      <p className="text-xs text-gray-500 capitalize">{apt.type || 'Consultation'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <FiClock size={12} /> {apt.timeSlot}
                    </span>
                    {apt.type === 'online' && (apt.status === 'confirmed' || apt.status === 'pending') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/video-call/${apt._id}?doctor=${encodeURIComponent(apt.patient?.name || 'Patient')}`)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                      >
                        <FiVideo size={10} /> Call
                      </motion.button>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[apt.status] || statusColors.pending}`}>
                      {apt.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">📅</motion.div>
              <p className="text-gray-500 text-sm">No appointments today</p>
              <p className="text-gray-600 text-xs mt-1">Enjoy your free day!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-light rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Appointments</h3>
            {upcomingCount > 0 && (
              <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary">{upcomingCount} upcoming</span>
            )}
          </div>

          {recentAppointments.length > 0 ? (
            <div className="space-y-3">
              {recentAppointments.slice(0, 6).map((apt, i) => {
                const isUpcoming = dayjs(apt.date).isAfter(dayjs()) && apt.status !== 'cancelled';
                return (
                  <motion.div
                    key={apt._id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="flex items-center justify-between p-3 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUpcoming ? 'bg-primary' : 'bg-gray-600'}`} />
                      <div>
                        <p className="text-sm text-white font-medium">{apt.patient?.name || 'Patient'}</p>
                        <p className="text-xs text-gray-500">
                          {dayjs(apt.date).format('MMM D')} at {apt.timeSlot}
                          {apt.symptoms && ` • ${apt.symptoms.slice(0, 30)}${apt.symptoms.length > 30 ? '...' : ''}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${statusColors[apt.status] || statusColors.pending}`}>
                      {apt.status}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">🩺</motion.div>
              <p className="text-gray-500 text-sm">No appointments yet</p>
              <p className="text-gray-600 text-xs mt-1">Patients will appear here when they book</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default DoctorDashboard;
