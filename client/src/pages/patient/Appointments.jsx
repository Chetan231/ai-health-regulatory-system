import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiPlus, FiFilter, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const statusConfig = {
  pending: { color: 'bg-warning/20 text-warning border-warning/30', icon: FiClock },
  confirmed: { color: 'bg-primary/20 text-primary border-primary/30', icon: FiCheck },
  completed: { color: 'bg-success/20 text-success border-success/30', icon: FiCheck },
  cancelled: { color: 'bg-danger/20 text-danger border-danger/30', icon: FiX },
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelModal, setCancelModal] = useState(null);

  useEffect(() => { fetchAppointments(); }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/appointments${params}`);
      setAppointments(data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/appointments/${id}`);
      toast.success('Appointment cancelled');
      setCancelModal(null);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  if (loading) return <Loader text="Loading appointments..." />;

  return (
    <AnimatedPage>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Appointments</span></h1>
          <p className="text-gray-400 mt-1">{appointments.length} total appointments</p>
        </motion.div>
        <Link to="/patient/appointments/book">
          <Button><FiPlus size={16} /> Book Appointment</Button>
        </Link>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {filters.map((f, i) => (
          <motion.button
            key={f}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-xl text-sm capitalize whitespace-nowrap transition-all
              ${filter === f ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10 hover:border-white/20'}
            `}
          >
            {f}
          </motion.button>
        ))}
      </motion.div>

      {/* Appointments List */}
      <div className="space-y-3">
        <AnimatePresence>
          {appointments.map((apt, i) => {
            const config = statusConfig[apt.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                className="bg-dark-light rounded-2xl border border-white/10 p-5 hover:border-white/15 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-white font-bold"
                    >
                      {apt.doctor?.name?.[0] || 'D'}
                    </motion.div>
                    <div>
                      <h3 className="text-white font-semibold">Dr. {apt.doctor?.name || 'Unknown'}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><FiCalendar size={11} /> {dayjs(apt.date).format('MMM D, YYYY')}</span>
                        <span className="flex items-center gap-1"><FiClock size={11} /> {apt.timeSlot}</span>
                        <span className="capitalize px-2 py-0.5 bg-white/5 rounded-md">{apt.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border capitalize ${config.color}`}
                    >
                      <StatusIcon size={12} /> {apt.status}
                    </motion.span>

                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCancelModal(apt._id)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-gray-500 hover:text-danger transition-colors"
                      >
                        <FiX size={16} />
                      </motion.button>
                    )}
                  </div>
                </div>

                {apt.symptoms && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-xs text-gray-500 bg-white/[0.02] p-2 rounded-lg"
                  >
                    <FiAlertCircle size={10} className="inline mr-1" /> {apt.symptoms}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">📅</motion.div>
            <p className="text-gray-400">No appointments found</p>
            <Link to="/patient/appointments/book" className="text-primary text-sm hover:underline mt-2 inline-block">Book your first appointment</Link>
          </motion.div>
        )}
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setCancelModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-sm mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-14 h-14 mx-auto bg-danger/20 rounded-2xl flex items-center justify-center mb-4"
              >
                <FiAlertCircle className="text-danger" size={28} />
              </motion.div>
              <h3 className="text-lg font-bold text-white text-center mb-2">Cancel Appointment?</h3>
              <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setCancelModal(null)}>Keep</Button>
                <Button variant="danger" className="flex-1" onClick={() => handleCancel(cancelModal)}>Cancel It</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Appointments;
