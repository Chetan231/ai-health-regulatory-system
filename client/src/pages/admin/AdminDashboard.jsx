import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiUserPlus, FiGrid, FiDollarSign, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-light border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-white font-bold">₹{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setData(data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const stats = data?.stats || {};
  const pieData = data?.appointmentsByStatus?.map(a => ({ name: a._id, value: a.count })) || [];

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin <span className="gradient-text">Dashboard</span> 🏥</h1>
        <p className="text-gray-400 mt-1">Hospital system overview and analytics</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard icon={FiUsers} label="Patients" value={stats.totalPatients || 0} color="primary" delay={0} />
        <StatsCard icon={FiUserPlus} label="Doctors" value={stats.totalDoctors || 0} color="success" delay={0.1} />
        <StatsCard icon={FiGrid} label="Departments" value={stats.totalDepartments || 0} color="secondary" delay={0.2} />
        <StatsCard icon={FiCalendar} label="Appointments" value={stats.totalAppointments || 0} color="accent" delay={0.3} />
        <StatsCard icon={FiDollarSign} label="Revenue" value={stats.totalRevenue || 0} color="warning" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FiTrendingUp className="text-primary" /> Monthly Revenue</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Appointment Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Appointments by Status</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {pieData.map((entry, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-gray-400 capitalize">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Departments & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Departments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Departments</h3>
          <div className="space-y-2">
            {(data?.departments || []).map((dept, i) => (
              <motion.div key={dept._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }} whileHover={{ x: 4 }} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all">
                <div>
                  <p className="text-sm text-white font-medium">{dept.name}</p>
                  <p className="text-[10px] text-gray-500">Head: {dept.headDoctor?.name || 'Not assigned'}</p>
                </div>
                <span className="text-xs text-gray-400">{dept.doctorCount} doctors</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Registrations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Recent Registrations</h3>
          <div className="space-y-2">
            {[...(data?.recentPatients || []), ...(data?.recentDoctors || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8).map((user, i) => (
              <motion.div key={user._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.04 }} whileHover={{ x: 4 }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{user.name}</p>
                  <p className="text-[10px] text-gray-500">{user.email}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default AdminDashboard;
