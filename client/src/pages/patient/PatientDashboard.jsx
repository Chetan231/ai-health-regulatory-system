import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import Loader from '../../components/common/Loader';
import { FiCalendar, FiFileText, FiHeart, FiActivity, FiTrendingUp, FiClock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 0, vitals: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [latestVitals, setLatestVitals] = useState({});
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, reportsRes, prescriptionsRes, vitalsRes, trendsRes] = await Promise.allSettled([
        api.get('/appointments?limit=50'),
        api.get('/reports'),
        api.get('/prescriptions'),
        api.get('/vitals?limit=50'),
        api.get('/vitals/trends?days=7'),
      ]);

      const appointments = appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data : { appointments: [], total: 0 };
      const reports = reportsRes.status === 'fulfilled' ? reportsRes.value.data : { reports: [], total: 0 };
      const prescriptions = prescriptionsRes.status === 'fulfilled' ? prescriptionsRes.value.data : { prescriptions: [], total: 0 };
      const vitals = vitalsRes.status === 'fulfilled' ? vitalsRes.value.data : { vitals: [], total: 0 };
      const trends = trendsRes.status === 'fulfilled' ? trendsRes.value.data : {};

      // Set stats with real counts
      setStats({
        appointments: appointments.total || appointments.appointments?.length || 0,
        reports: reports.total || reports.reports?.length || 0,
        prescriptions: prescriptions.total || prescriptions.prescriptions?.length || 0,
        vitals: vitals.total || vitals.vitals?.length || 0,
      });

      // Upcoming appointments
      const upcoming = (appointments.appointments || [])
        .filter(a => a.status !== 'cancelled' && dayjs(a.date).isAfter(dayjs()))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
      setUpcomingAppointments(upcoming);

      // Build recent activity from real data
      const activity = [];

      (appointments.appointments || []).slice(0, 3).forEach(a => {
        activity.push({
          title: `Appointment with Dr. ${a.doctor?.name || 'Doctor'}`,
          subtitle: a.status === 'completed' ? 'Completed' : a.status === 'confirmed' ? 'Confirmed' : a.status === 'cancelled' ? 'Cancelled' : 'Pending',
          time: dayjs(a.date).fromNow(),
          icon: FiCalendar,
          color: a.status === 'completed' ? 'text-success' : a.status === 'confirmed' ? 'text-primary' : 'text-warning',
          sortDate: new Date(a.date),
        });
      });

      (reports.reports || []).slice(0, 3).forEach(r => {
        activity.push({
          title: r.title || `${r.type} Report`,
          subtitle: 'Report Ready',
          time: dayjs(r.createdAt).fromNow(),
          icon: FiFileText,
          color: 'text-success',
          sortDate: new Date(r.createdAt),
        });
      });

      (prescriptions.prescriptions || []).slice(0, 2).forEach(p => {
        activity.push({
          title: `Prescription: ${p.diagnosis || 'Medical Prescription'}`,
          subtitle: `${p.medications?.length || 0} medications`,
          time: dayjs(p.createdAt).fromNow(),
          icon: FiHeart,
          color: 'text-secondary',
          sortDate: new Date(p.createdAt),
        });
      });

      (vitals.vitals || []).slice(0, 2).forEach(v => {
        activity.push({
          title: `Vital Recorded: ${v.type}`,
          subtitle: `${v.value} ${v.unit}`,
          time: dayjs(v.recordedAt || v.createdAt).fromNow(),
          icon: FiActivity,
          color: 'text-accent',
          sortDate: new Date(v.recordedAt || v.createdAt),
        });
      });

      // Sort by most recent
      activity.sort((a, b) => b.sortDate - a.sortDate);
      setRecentActivity(activity.slice(0, 6));

      // Latest vitals for health score section
      const latest = {};
      for (const [type, data] of Object.entries(trends)) {
        if (data && data.length > 0) {
          latest[type] = data[data.length - 1];
        }
      }
      setLatestVitals(latest);

      // Calculate a simple health score based on available data
      let score = 50; // base score
      if (Object.keys(latest).length > 0) score += 10; // tracking vitals = good
      if ((appointments.appointments || []).some(a => a.status === 'completed')) score += 10; // has completed visits
      if ((reports.reports || []).length > 0) score += 10; // has reports
      if (Object.keys(latest).length >= 3) score += 10; // tracking multiple vitals
      if (upcoming.length > 0) score += 10; // has upcoming appointments
      setHealthScore(Math.min(score, 100));

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

  const getVitalStatus = (type, value) => {
    if (!value) return { status: 'No data', color: 'text-gray-500' };
    const v = parseFloat(value);
    switch (type) {
      case 'heart-rate':
        if (v >= 60 && v <= 100) return { status: `${value} bpm`, color: 'text-success' };
        return { status: `${value} bpm`, color: 'text-warning' };
      case 'blood-pressure':
        return { status: value, color: value.includes('/') && parseInt(value) < 140 ? 'text-success' : 'text-warning' };
      case 'glucose':
        if (v >= 70 && v <= 140) return { status: `${value} mg/dL`, color: 'text-success' };
        return { status: `${value} mg/dL`, color: 'text-warning' };
      case 'temperature':
        if (v >= 97 && v <= 99.5) return { status: `${value}°F`, color: 'text-success' };
        return { status: `${value}°F`, color: 'text-warning' };
      case 'oxygen-saturation':
        if (v >= 95) return { status: `${value}%`, color: 'text-success' };
        return { status: `${value}%`, color: 'text-warning' };
      default:
        return { status: `${value}`, color: 'text-primary' };
    }
  };

  const vitalLabels = {
    'heart-rate': 'Heart Rate',
    'blood-pressure': 'Blood Pressure',
    'glucose': 'Blood Glucose',
    'temperature': 'Temperature',
    'oxygen-saturation': 'SpO2',
    'weight': 'Weight',
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const statsData = [
    { icon: FiCalendar, label: 'Appointments', value: stats.appointments, color: 'primary' },
    { icon: FiFileText, label: 'Reports', value: stats.reports, color: 'success' },
    { icon: FiHeart, label: 'Prescriptions', value: stats.prescriptions, color: 'secondary' },
    { icon: FiActivity, label: 'Vitals Recorded', value: stats.vitals, color: 'accent' },
  ];

  return (
    <AnimatedPage>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">
          {getGreeting()}, <span className="gradient-text">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your health overview for today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsData.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Upcoming Appointments Banner */}
      {upcomingAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <FiCalendar className="text-primary" size={18} />
            <h3 className="text-white font-semibold">Upcoming Appointments</h3>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.map((apt, i) => (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl"
              >
                <div>
                  <p className="text-sm text-white font-medium">Dr. {apt.doctor?.name || 'Doctor'}</p>
                  <p className="text-xs text-gray-400">{dayjs(apt.date).format('MMM D, YYYY')} at {apt.timeSlot}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg capitalize ${
                  apt.status === 'confirmed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                }`}>
                  {apt.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 bg-dark-light rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Health Score</h3>
          <div className="flex items-center justify-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="relative w-40 h-40"
            >
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="52" fill="none" stroke="url(#gradient)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={326.7}
                  initial={{ strokeDashoffset: 326.7 }}
                  animate={{ strokeDashoffset: 326.7 * (1 - healthScore / 100) }}
                  transition={{ duration: 2, delay: 0.8, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-3xl font-bold gradient-text"
                >
                  {healthScore}
                </motion.span>
                <span className="text-xs text-gray-400">out of 100</span>
              </div>
            </motion.div>
          </div>

          {/* Latest Vitals */}
          <div className="space-y-2">
            {Object.keys(latestVitals).length > 0 ? (
              Object.entries(latestVitals).slice(0, 4).map(([type, data], i) => {
                const vs = getVitalStatus(type, data.value);
                return (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-gray-400">{vitalLabels[type] || type}</span>
                    <span className={`text-sm font-medium ${vs.color}`}>{vs.status}</span>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center py-4"
              >
                <FiAlertCircle className="mx-auto text-gray-600 mb-2" size={20} />
                <p className="text-xs text-gray-500">No vitals recorded yet</p>
                <Link to="/patient/vitals" className="text-xs text-primary hover:underline mt-1 block">
                  Record your first vital →
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-dark-light rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`p-2 rounded-xl bg-white/5 ${item.color}`}
                  >
                    <item.icon size={18} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.subtitle && <span className="text-xs text-gray-500">{item.subtitle}</span>}
                      <span className="text-xs text-gray-600">•</span>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FiClock size={10} /> {item.time}
                      </p>
                    </div>
                  </div>
                  <motion.div whileHover={{ x: 3 }}>
                    <FiTrendingUp size={16} className="text-gray-500" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🏥
              </motion.div>
              <p className="text-gray-400 mb-2">No activity yet</p>
              <p className="text-xs text-gray-500">Book your first appointment or record vitals to get started</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Link to="/patient/appointments/book">
                  <motion.span whileHover={{ scale: 1.05 }} className="text-xs text-primary hover:underline cursor-pointer">
                    Book Appointment →
                  </motion.span>
                </Link>
                <Link to="/patient/vitals">
                  <motion.span whileHover={{ scale: 1.05 }} className="text-xs text-primary hover:underline cursor-pointer">
                    Record Vitals →
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default PatientDashboard;
