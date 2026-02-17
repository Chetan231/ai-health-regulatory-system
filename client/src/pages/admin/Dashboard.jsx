import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel 🏢</h1>
        <p className="text-gray-500 mb-8">Hospital management dashboard — {user?.name}</p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Patients', value: '0' },
            { label: 'Total Doctors', value: '0' },
            { label: 'Departments', value: '0' },
            { label: 'Revenue (₹)', value: '0' },
          ].map((s, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p className="text-lg">🏗️ Full dashboard coming in Sprint 5</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
