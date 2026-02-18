import { motion } from 'framer-motion';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import { FiCalendar, FiFileText, FiHeart, FiActivity, FiTrendingUp, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: FiCalendar, label: 'Appointments', value: 12, change: 8, color: 'primary' },
    { icon: FiFileText, label: 'Reports', value: 24, change: 15, color: 'success' },
    { icon: FiHeart, label: 'Prescriptions', value: 8, change: -3, color: 'secondary' },
    { icon: FiActivity, label: 'Vitals Recorded', value: 156, change: 22, color: 'accent' },
  ];

  const recentActivity = [
    { title: 'Blood Test Report Ready', time: '2 hours ago', icon: FiFileText, color: 'text-success' },
    { title: 'Appointment with Dr. Smith', time: '5 hours ago', icon: FiCalendar, color: 'text-primary' },
    { title: 'Prescription Updated', time: '1 day ago', icon: FiHeart, color: 'text-secondary' },
    { title: 'Vitals Recorded', time: '1 day ago', icon: FiActivity, color: 'text-accent' },
    { title: 'ECG Report Uploaded', time: '3 days ago', icon: FiFileText, color: 'text-warning' },
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
          Good Morning, <span className="gradient-text">{user?.name}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1">Here's your health overview for today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

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
                  animate={{ strokeDashoffset: 326.7 * 0.15 }}
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
                  85
                </motion.span>
                <span className="text-xs text-gray-400">out of 100</span>
              </div>
            </motion.div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Blood Pressure', status: 'Normal', color: 'text-success' },
              { label: 'Heart Rate', status: '72 bpm', color: 'text-primary' },
              { label: 'Glucose', status: 'Slightly High', color: 'text-warning' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </motion.div>
            ))}
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
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <FiClock size={10} /> {item.time}
                  </p>
                </div>
                <motion.div whileHover={{ x: 3 }}>
                  <FiTrendingUp size={16} className="text-gray-500" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default PatientDashboard;
