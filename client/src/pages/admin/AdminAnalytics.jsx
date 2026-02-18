import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiTrendingUp, FiUsers, FiCalendar } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AnimatedPage from '../../components/common/AnimatedPage';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-light border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-gray-400">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-sm font-medium" style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setData(data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">System <span className="gradient-text">Analytics</span> 📊</h1>
        <p className="text-gray-400 mt-1">Detailed hospital performance metrics</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiTrendingUp className="text-success" /> Revenue Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Appointments by Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiCalendar className="text-primary" /> Appointment Status</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.appointmentsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiActivity className="text-secondary" /> Department Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-white/10">
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Head Doctor</th>
                  <th className="pb-3 font-medium">Doctors</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.departments || []).map((dept, i) => (
                  <motion.tr
                    key={dept._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 text-sm text-white font-medium">{dept.name}</td>
                    <td className="py-3 text-sm text-gray-400">{dept.headDoctor?.name || 'N/A'}</td>
                    <td className="py-3 text-sm text-gray-400">{dept.doctorCount}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${dept.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default AdminAnalytics;
