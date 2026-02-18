import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiClock, FiUser, FiX, FiAlertCircle, FiSun, FiMoon, FiSunrise } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const frequencyIcons = {
  'Once daily': [FiSun],
  'Twice daily': [FiSunrise, FiMoon],
  'Three times daily': [FiSunrise, FiSun, FiMoon],
};

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/prescriptions');
        setPrescriptions(data.prescriptions);
      } catch (err) {
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading prescriptions..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Prescriptions</span></h1>
        <p className="text-gray-400 mt-1">{prescriptions.length} prescriptions</p>
      </motion.div>

      <div className="space-y-4">
        {prescriptions.map((rx, i) => (
          <motion.div
            key={rx._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            onClick={() => setSelectedRx(rx)}
            className="bg-dark-light rounded-2xl border border-white/10 p-5 cursor-pointer hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="p-3 rounded-xl bg-secondary/10 text-secondary"
                >
                  <FiHeart size={22} />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold">{rx.diagnosis}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <FiUser size={11} /> Dr. {rx.doctor?.name}
                    <span className="text-gray-600">•</span>
                    <FiClock size={11} /> {dayjs(rx.date).format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-secondary/10 text-secondary px-2.5 py-1 rounded-full border border-secondary/20">
                {rx.medications?.length} meds
              </span>
            </div>

            {/* Quick medication preview */}
            <div className="mt-3 flex flex-wrap gap-2">
              {rx.medications?.slice(0, 3).map((med, j) => (
                <motion.span
                  key={j}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + j * 0.05 }}
                  className="px-2.5 py-1 bg-white/5 rounded-lg text-[11px] text-gray-300 border border-white/5"
                >
                  💊 {med.name} - {med.dosage}
                </motion.span>
              ))}
              {rx.medications?.length > 3 && (
                <span className="text-[11px] text-gray-500 py-1">+{rx.medications.length - 3} more</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {prescriptions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">💊</motion.div>
          <p className="text-gray-400">No prescriptions yet</p>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRx(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-xl flex items-center justify-center mb-3">
                    <FiHeart className="text-white" size={22} />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">{selectedRx.diagnosis}</h2>
                  <p className="text-sm text-gray-400">Dr. {selectedRx.doctor?.name} • {dayjs(selectedRx.date).format('MMMM D, YYYY')}</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={() => setSelectedRx(null)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                  <FiX size={20} />
                </motion.button>
              </div>

              {/* Medications */}
              <h3 className="text-sm font-semibold text-white mb-3">Medications</h3>
              <div className="space-y-3">
                {selectedRx.medications?.map((med, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>💊</motion.span>
                        {med.name}
                      </h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{med.dosage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <p><span className="text-gray-500">Frequency:</span> {med.frequency}</p>
                      <p><span className="text-gray-500">Duration:</span> {med.duration}</p>
                    </div>
                    {med.instructions && (
                      <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                        <FiAlertCircle size={11} className="mt-0.5 text-warning flex-shrink-0" />
                        {med.instructions}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>

              {selectedRx.notes && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-white/[0.02] rounded-xl"
                >
                  <p className="text-xs text-gray-500 mb-1">Doctor's Notes</p>
                  <p className="text-sm text-gray-300">{selectedRx.notes}</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Prescriptions;
