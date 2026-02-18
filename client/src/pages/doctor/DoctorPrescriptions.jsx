import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiPlus, FiUser, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Prescriptions</span></h1>
          <p className="text-gray-400 mt-1">{prescriptions.length} prescriptions written</p>
        </motion.div>
        <Link to="/doctor/prescriptions/create">
          <Button><FiPlus size={16} /> Write Prescription</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {prescriptions.map((rx, i) => (
          <motion.div
            key={rx._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            className="bg-dark-light rounded-2xl border border-white/10 p-5 hover:border-secondary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ rotate: 10 }} className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                  <FiHeart size={20} />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold">{rx.diagnosis}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiUser size={11} /> {rx.patient?.name}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={11} /> {dayjs(rx.date).format('MMM D, YYYY')}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {rx.medications?.slice(0, 2).map((med, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 bg-white/5 rounded-md text-gray-400">💊 {med.name}</span>
                ))}
                {rx.medications?.length > 2 && <span className="text-[10px] text-gray-500 py-0.5">+{rx.medications.length - 2}</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {prescriptions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">💊</motion.div>
          <p className="text-gray-400">No prescriptions written yet</p>
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default DoctorPrescriptions;
