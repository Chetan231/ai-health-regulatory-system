import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiMail, FiPhone, FiDroplet, FiCalendar } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/admin/patients${search ? `?search=${search}` : ''}`);
        setPatients(data.patients);
      } catch (err) {
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetch, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) return <Loader text="Loading patients..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">All <span className="gradient-text">Patients</span></h1>
        <p className="text-gray-400 mt-1">{patients.length} patients registered</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients by name or email..." className="w-full max-w-md bg-dark-light border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-primary transition-all" />
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((p, i) => (
          <motion.div
            key={p.user?._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-dark-light rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <motion.div whileHover={{ scale: 1.1 }} className="w-11 h-11 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                {p.user?.name?.[0]?.toUpperCase()}
              </motion.div>
              <div>
                <h3 className="text-white font-semibold text-sm">{p.user?.name}</h3>
                <p className="text-[10px] text-gray-500">{dayjs(p.user?.createdAt).format('Joined MMM YYYY')}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p className="flex items-center gap-2"><FiMail size={11} /> {p.user?.email}</p>
              {p.user?.phone && <p className="flex items-center gap-2"><FiPhone size={11} /> {p.user.phone}</p>}
              {p.profile?.bloodGroup && <p className="flex items-center gap-2"><FiDroplet size={11} className="text-danger" /> {p.profile.bloodGroup}</p>}
              {p.profile?.gender && <p className="capitalize">{p.profile.gender} {p.profile?.dateOfBirth ? `• ${dayjs().diff(dayjs(p.profile.dateOfBirth), 'year')} years` : ''}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {patients.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">👥</motion.div>
          <p className="text-gray-400">No patients found</p>
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default ManagePatients;
