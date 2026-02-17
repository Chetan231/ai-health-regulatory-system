import { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../api/adminApi';
import { FiUsers, FiUserCheck, FiCalendar, FiFileText, FiGrid, FiLayers, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div></div>;
  }

  const s = data?.stats || {};
  const apptStats = data?.appointmentStats || {};
  const pieData = [
    { name: 'Pending', value: apptStats.pending || 0 },
    { name: 'Confirmed', value: apptStats.confirmed || 0 },
    { name: 'Completed', value: apptStats.completed || 0 },
    { name: 'Cancelled', value: apptStats.cancelled || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard 🏢</h1>
        <p className="text-gray-500 mt-1">Hospital-wide analytics and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: s.totalPatients, icon: FiUsers, color: 'blue' },
          { label: 'Total Doctors', value: s.totalDoctors, icon: FiUserCheck, color: 'emerald' },
          { label: 'Appointments', value: s.totalAppointments, icon: FiCalendar, color: 'orange' },
          { label: "Today's Appts", value: s.todayAppointments, icon: FiTrendingUp, color: 'pink' },
          { label: 'Prescriptions', value: s.totalPrescriptions, icon: FiFileText, color: 'purple' },
          { label: 'Departments', value: s.totalDepartments, icon: FiGrid, color: 'cyan' },
          { label: 'Available Beds', value: `${s.availableBeds}/${s.totalBeds}`, icon: FiLayers, color: 'green' },
          { label: 'Revenue', value: `₹${(s.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'yellow' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              item.color === 'orange' ? 'bg-orange-50 text-orange-600' :
              item.color === 'pink' ? 'bg-pink-50 text-pink-600' :
              item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              item.color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
              item.color === 'green' ? 'bg-green-50 text-green-600' :
              'bg-yellow-50 text-yellow-600'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.value || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Appointment Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Status Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-12">No appointment data yet</p>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
          {data?.recentAppointments?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.recentAppointments.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{a.patientId?.name}</p>
                    <p className="text-xs text-gray-500">Dr. {a.doctorId?.name} • {a.timeSlot}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    a.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No appointments yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
