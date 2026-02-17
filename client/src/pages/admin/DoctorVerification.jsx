import { useState, useEffect } from 'react';
import { getPendingDoctors, verifyDoctor } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { FiCheck, FiUserCheck } from 'react-icons/fi';

const DoctorVerification = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPendingDoctors();
      setDoctors(res.data.data.doctors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try {
      await verifyDoctor(id);
      toast.success('Doctor verified!');
      setDoctors(doctors.filter((d) => d.user._id !== id));
    } catch (err) { toast.error('Failed to verify'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Doctor Verification</h1>
        <p className="text-gray-500 mt-1">Review and verify new doctor registrations</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiUserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">All caught up!</p>
          <p className="text-sm mt-1">No pending doctor verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((d) => (
            <div key={d.user._id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl flex-shrink-0">
                    {d.user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dr. {d.user.name}</h3>
                    <p className="text-sm text-gray-500">{d.user.email} • {d.user.phone || 'No phone'}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 mt-3 text-sm">
                      <div><span className="text-gray-500">Specialization:</span> <span className="font-medium">{d.profile?.specialization}</span></div>
                      <div><span className="text-gray-500">Qualification:</span> <span className="font-medium">{d.profile?.qualification}</span></div>
                      <div><span className="text-gray-500">License:</span> <span className="font-medium">{d.profile?.licenseNumber}</span></div>
                      <div><span className="text-gray-500">Experience:</span> <span className="font-medium">{d.profile?.experience || 0} years</span></div>
                      <div><span className="text-gray-500">Fee:</span> <span className="font-medium">₹{d.profile?.consultationFee || 0}</span></div>
                      <div><span className="text-gray-500">Registered:</span> <span className="font-medium">{new Date(d.user.createdAt).toLocaleDateString('en-IN')}</span></div>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleVerify(d.user._id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex-shrink-0">
                  <FiCheck className="w-4 h-4" /> Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorVerification;
