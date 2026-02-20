import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiCheck, FiX, FiUser, FiVideo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const statusConfig = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  confirmed: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-danger/20 text-danger border-danger/30',
};

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <Loader text="Loading appointments..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Manage <span className="gradient-text">Appointments</span></h1>
        <p className="text-gray-400 mt-1">{appointments.length} appointments</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f, i) => (
          <motion.button
            key={f}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10'}`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {appointments.map((apt, i) => (
            <motion.div
              key={apt._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className="bg-dark-light rounded-2xl border border-white/10 p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-white font-bold"
                  >
                    {apt.patient?.name?.[0] || 'P'}
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold">{apt.patient?.name || 'Unknown'}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FiCalendar size={11} /> {dayjs(apt.date).format('MMM D, YYYY')}</span>
                      <span className="flex items-center gap-1"><FiClock size={11} /> {apt.timeSlot}</span>
                      <span className="capitalize px-2 py-0.5 bg-white/5 rounded-md">{apt.type}</span>
                    </div>
                    {apt.symptoms && <p className="text-xs text-gray-500 mt-1">Symptoms: {apt.symptoms}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-medium border capitalize ${statusConfig[apt.status]}`}>
                    {apt.status}
                  </span>

                  {apt.type === 'online' && (apt.status === 'confirmed' || apt.status === 'pending') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/video-call/${apt._id}?doctor=${encodeURIComponent(apt.patient?.name || 'Patient')}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-green-500 text-white hover:bg-green-500/80 transition-all shadow-lg shadow-green-500/20"
                    >
                      <FiVideo size={14} /> Join Call
                    </motion.button>
                  )}

                  {apt.status === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateStatus(apt._id, 'confirmed')}
                        className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20"
                      >
                        <FiCheck size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateStatus(apt._id, 'cancelled')}
                        className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20"
                      >
                        <FiX size={16} />
                      </motion.button>
                    </>
                  )}

                  {apt.status === 'confirmed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateStatus(apt._id, 'completed')}
                      className="px-3 py-1.5 rounded-xl bg-success/10 text-success text-xs border border-success/20 hover:bg-success/20"
                    >
                      Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {appointments.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">📋</motion.div>
            <p className="text-gray-400">No appointments found</p>
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default DoctorAppointments;
