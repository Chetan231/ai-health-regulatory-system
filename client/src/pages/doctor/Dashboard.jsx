import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDoctorDashboard } from '../../api/doctorApi';
import { FiUsers, FiCalendar, FiFileText, FiClock, FiStar, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDoctorDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;
  }

  const stats = data?.stats;
  const profile = data?.profile;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, Dr. {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">
          {profile?.specialization} • {profile?.experience || 0} years experience
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: FiCalendar, color: 'emerald' },
          { label: 'Total Patients', value: stats?.totalPatients || 0, icon: FiUsers, color: 'blue' },
          { label: 'Pending Consults', value: stats?.pendingConsults || 0, icon: FiClock, color: 'orange' },
          { label: 'Prescriptions', value: stats?.prescriptionsWritten || 0, icon: FiFileText, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              s.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              s.color === 'orange' ? 'bg-orange-50 text-orange-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Doctor Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Specialization</span>
              <span className="font-medium text-gray-900">{profile?.specialization}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Qualification</span>
              <span className="font-medium text-gray-900">{profile?.qualification}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Experience</span>
              <span className="font-medium text-gray-900">{profile?.experience || 0} years</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Consultation Fee</span>
              <span className="font-medium text-gray-900">₹{profile?.consultationFee || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">License</span>
              <span className="font-medium text-gray-900">{profile?.licenseNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Rating</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {profile?.rating || 0} ({profile?.totalReviews || 0} reviews)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                profile?.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {profile?.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            <Link to="/doctor/schedule" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              Manage <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {profile?.availability?.length > 0 ? (
            <div className="space-y-2">
              {profile.availability.map((slot, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="font-medium text-gray-900 w-12">{slot.day}</span>
                  <span className="text-gray-600">{slot.startTime} – {slot.endTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FiClock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No schedule set</p>
              <Link to="/doctor/schedule" className="text-emerald-600 text-sm hover:underline mt-1 inline-block">Set your availability →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/doctor/patients', label: 'View Patients', icon: '👥' },
            { to: '/doctor/schedule', label: 'Manage Schedule', icon: '🕐' },
            { to: '/doctor/profile', label: 'Edit Profile', icon: '👤' },
            { to: '/doctor/appointments', label: 'Appointments', icon: '📅' },
          ].map((a, i) => (
            <Link key={i} to={a.to} className="p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition text-center">
              <div className="text-2xl mb-1">{a.icon}</div>
              <p className="text-sm font-medium text-gray-700">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
