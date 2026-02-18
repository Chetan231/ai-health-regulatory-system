import { motion } from 'framer-motion';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import { FiUsers, FiCalendar, FiFileText, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: FiUsers, label: 'Total Patients', value: 248, change: 12, color: 'primary' },
    { icon: FiCalendar, label: "Today's Appointments", value: 8, color: 'success' },
    { icon: FiFileText, label: 'Pending Reports', value: 5, change: -20, color: 'warning' },
    { icon: FiCheckCircle, label: 'Completed Today', value: 3, color: 'accent' },
  ];

  const todayAppointments = [
    { patient: 'Sarah Johnson', time: '09:00 AM', type: 'Check-up', status: 'completed' },
    { patient: 'Mike Chen', time: '10:30 AM', type: 'Follow-up', status: 'completed' },
    { patient: 'Emily Davis', time: '11:30 AM', type: 'Consultation', status: 'completed' },
    { patient: 'James Wilson', time: '02:00 PM', type: 'Check-up', status: 'confirmed' },
    { patient: 'Lisa Park', time: '03:00 PM', type: 'Follow-up', status: 'confirmed' },
    { patient: 'Robert Brown', time: '04:30 PM', type: 'Consultation', status: 'pending' },
  ];

  const statusColors = {
    completed: 'bg-success/20 text-success',
    confirmed: 'bg-primary/20 text-primary',
    pending: 'bg-warning/20 text-warning',
  };

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Hello, <span className="gradient-text">Dr. {user?.name}</span> 🩺
        </h1>
        <p className="text-gray-400 mt-1">You have 8 appointments today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <StatsCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-light rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {todayAppointments.map((apt, i) => (
            <motion.div
              key={i}
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
                  {apt.patient.split(' ').map(n => n[0]).join('')}
                </motion.div>
                <div>
                  <p className="text-sm text-white font-medium">{apt.patient}</p>
                  <p className="text-xs text-gray-500">{apt.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <FiClock size={12} /> {apt.time}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[apt.status]}`}>
                  {apt.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatedPage>
  );
};

export default DoctorDashboard;
