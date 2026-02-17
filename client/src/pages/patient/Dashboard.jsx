import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPatientDashboard } from '../../api/patientApi';
import { FiHeart, FiActivity, FiThermometer, FiDroplet, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getPatientDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const vitals = data?.latestVitals;
  const stats = data?.stats;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your health overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vitals Recorded', value: stats?.vitalsRecorded || 0, icon: FiActivity, color: 'blue' },
          { label: 'Appointments', value: stats?.appointments || 0, icon: FiHeart, color: 'green' },
          { label: 'Prescriptions', value: stats?.prescriptions || 0, icon: FiDroplet, color: 'purple' },
          { label: 'Lab Reports', value: stats?.labReports || 0, icon: FiThermometer, color: 'orange' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              s.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              s.color === 'green' ? 'bg-green-50 text-green-600' :
              s.color === 'purple' ? 'bg-purple-50 text-purple-600' :
              'bg-orange-50 text-orange-600'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Vitals + Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Latest Vitals */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Latest Vitals</h2>
            <Link to="/patient/vitals" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {vitals ? (
            <div className="grid grid-cols-2 gap-4">
              {vitals.bloodPressure?.systolic && (
                <div className="p-3 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600 font-medium">Blood Pressure</p>
                  <p className="text-lg font-bold text-gray-900">{vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}</p>
                  <p className="text-xs text-gray-500">mmHg</p>
                </div>
              )}
              {vitals.heartRate && (
                <div className="p-3 bg-pink-50 rounded-xl">
                  <p className="text-xs text-pink-600 font-medium">Heart Rate</p>
                  <p className="text-lg font-bold text-gray-900">{vitals.heartRate}</p>
                  <p className="text-xs text-gray-500">bpm</p>
                </div>
              )}
              {vitals.oxygenSaturation && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium">SpO₂</p>
                  <p className="text-lg font-bold text-gray-900">{vitals.oxygenSaturation}%</p>
                  <p className="text-xs text-gray-500">Oxygen</p>
                </div>
              )}
              {vitals.temperature && (
                <div className="p-3 bg-orange-50 rounded-xl">
                  <p className="text-xs text-orange-600 font-medium">Temperature</p>
                  <p className="text-lg font-bold text-gray-900">{vitals.temperature}°F</p>
                  <p className="text-xs text-gray-500">Body temp</p>
                </div>
              )}
              {vitals.weight && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-xs text-green-600 font-medium">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{vitals.weight}</p>
                  <p className="text-xs text-gray-500">kg</p>
                </div>
              )}
              {vitals.bloodSugar?.fasting && (
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-600 font-medium">Blood Sugar (F)</p>
                  <p className="text-lg font-bold text-gray-900">{vitals.bloodSugar.fasting}</p>
                  <p className="text-xs text-gray-500">mg/dL</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FiHeart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No vitals recorded yet</p>
              <Link to="/patient/vitals" className="text-blue-600 text-sm hover:underline mt-1 inline-block">Record your first vitals →</Link>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          {data?.alerts?.length > 0 ? (
            <div className="space-y-3">
              {data.alerts.slice(0, 5).map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                  alert.severity === 'critical' ? 'bg-red-50' :
                  alert.severity === 'high' ? 'bg-orange-50' :
                  alert.severity === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <FiAlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'high' ? 'text-orange-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(alert.recordedAt).toLocaleDateString()} • {alert.severity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FiAlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No alerts — you're looking good! 💪</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/patient/vitals', label: 'Record Vitals', icon: '❤️' },
            { to: '/patient/timeline', label: 'Health Timeline', icon: '📋' },
            { to: '/patient/profile', label: 'Update Profile', icon: '👤' },
            { to: '/patient/appointments', label: 'Book Appointment', icon: '📅' },
          ].map((a, i) => (
            <Link key={i} to={a.to} className="p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition text-center">
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
