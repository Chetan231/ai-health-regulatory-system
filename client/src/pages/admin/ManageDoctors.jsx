import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiCheck, FiX, FiSearch, FiFilter, FiStar, FiPhone, FiMail } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  useEffect(() => { fetchDoctors(); }, [filter]);

  const fetchDoctors = async () => {
    try {
      const params = filter !== 'all' ? `?approved=${filter === 'approved'}` : '';
      const { data } = await api.get(`/admin/doctors${params}`);
      setDoctors(data.doctors);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, approved) => {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { approved });
      toast.success(`Doctor ${approved ? 'approved' : 'rejected'}`);
      fetchDoctors();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <Loader text="Loading doctors..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Manage <span className="gradient-text">Doctors</span></h1>
        <p className="text-gray-400 mt-1">{doctors.length} doctors registered</p>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {['all', 'approved', 'pending'].map((f, i) => (
          <motion.button
            key={f}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${filter === f ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10'}`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc, i) => (
          <motion.div
            key={doc._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-dark-light rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                {doc.userId?.name?.[0]?.toUpperCase()}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">Dr. {doc.userId?.name}</h3>
                <p className="text-xs text-primary">{doc.specialization}</p>
              </div>
              <motion.span
                whileHover={{ scale: 1.1 }}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${doc.isApproved ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}
              >
                {doc.isApproved ? 'Approved' : 'Pending'}
              </motion.span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-400 mb-4">
              <p className="flex items-center gap-2"><FiMail size={11} /> {doc.userId?.email}</p>
              {doc.userId?.phone && <p className="flex items-center gap-2"><FiPhone size={11} /> {doc.userId.phone}</p>}
              <p className="flex items-center gap-2"><FiStar className="text-warning" size={11} /> License: {doc.licenseNumber}</p>
              <p>Experience: {doc.experience} years • Fee: ₹{doc.consultationFee}</p>
            </div>

            {!doc.isApproved && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVerify(doc._id, true)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-success/10 text-success text-xs border border-success/20 hover:bg-success/20 transition-all"
                >
                  <FiCheck size={14} /> Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVerify(doc._id, false)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-danger/10 text-danger text-xs border border-danger/20 hover:bg-danger/20 transition-all"
                >
                  <FiX size={14} /> Reject
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {doctors.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">👨‍⚕️</motion.div>
          <p className="text-gray-400">No doctors found</p>
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default ManageDoctors;
