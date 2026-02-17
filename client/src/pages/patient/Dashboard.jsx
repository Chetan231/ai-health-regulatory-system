import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name} 👋</h1>
        <p className="text-gray-500 mb-8">Your health dashboard — everything at a glance.</p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Upcoming Appointments', value: '0', color: 'blue' },
            { label: 'Active Prescriptions', value: '0', color: 'green' },
            { label: 'Vitals Recorded', value: '0', color: 'purple' },
            { label: 'Lab Reports', value: '0', color: 'orange' },
          ].map((s, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p className="text-lg">🏗️ Full dashboard coming in Sprint 2</p>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
