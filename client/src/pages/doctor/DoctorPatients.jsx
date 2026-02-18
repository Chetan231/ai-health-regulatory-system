import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiCalendar, FiFileText, FiDroplet, FiPhone } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/doctors/my-patients');
        setPatients(data);
      } catch (err) {
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter(p =>
    p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading patients..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Patients</span></h1>
        <p className="text-gray-400 mt-1">{patients.length} total patients</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients..."
          className="w-full max-w-md bg-dark-light border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-primary transition-all"
        />
      </motion.div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.user?._id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-dark-light rounded-2xl border border-white/10 p-5 hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold"
              >
                {p.user?.name?.[0]?.toUpperCase() || '?'}
              </motion.div>
              <div>
                <h3 className="text-white font-semibold text-sm">{p.user?.name}</h3>
                <p className="text-xs text-gray-500">{p.user?.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-400">
              {p.profile?.bloodGroup && (
                <p className="flex items-center gap-2"><FiDroplet size={12} className="text-danger" /> {p.profile.bloodGroup}</p>
              )}
              {p.profile?.gender && (
                <p className="flex items-center gap-2"><FiUser size={12} /> {p.profile.gender}</p>
              )}
              {p.user?.phone && (
                <p className="flex items-center gap-2"><FiPhone size={12} /> {p.user.phone}</p>
              )}
              <p className="flex items-center gap-2"><FiCalendar size={12} /> Last visit: {dayjs(p.lastVisit).format('MMM D, YYYY')}</p>
            </div>

            {p.profile?.chronicConditions?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.profile.chronicConditions.map((c, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + j * 0.05 }}
                    className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] rounded-full border border-warning/20"
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">👥</motion.div>
          <p className="text-gray-400">No patients found</p>
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default DoctorPatients;
