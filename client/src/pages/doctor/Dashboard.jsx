import { useAuth } from '../../contexts/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dr. {user?.name} 👋</h1>
        <p className="text-gray-500 mb-8">Your doctor dashboard — manage patients and appointments.</p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Today's Appointments", value: '0' },
            { label: 'Total Patients', value: '0' },
            { label: 'Pending Consults', value: '0' },
            { label: 'Prescriptions Written', value: '0' },
          ].map((s, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <p className="text-lg">🏗️ Full dashboard coming in Sprint 3</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
