import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDoctorProfile, updateDoctorProfile } from '../../api/doctorApi';
import { updateProfile as updateUserProfile } from '../../api/authApi';
import toast from 'react-hot-toast';
import { FiSave, FiUser, FiSettings } from 'react-icons/fi';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('personal');

  const [personal, setPersonal] = useState({ name: '', phone: '' });
  const [doctor, setDoctor] = useState({
    specialization: '', qualification: '', experience: '', consultationFee: '', isAvailable: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDoctorProfile();
        const { user: u, profile: p } = res.data.data;
        setPersonal({ name: u.name || '', phone: u.phone || '' });
        setDoctor({
          specialization: p.specialization || '',
          qualification: p.qualification || '',
          experience: p.experience || '',
          consultationFee: p.consultationFee || '',
          isAvailable: p.isAvailable ?? true,
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(personal);
      await loadUser();
      toast.success('Personal info updated');
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctorProfile({
        ...doctor,
        experience: doctor.experience ? Number(doctor.experience) : 0,
        consultationFee: doctor.consultationFee ? Number(doctor.consultationFee) : 0,
      });
      toast.success('Doctor profile updated');
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal and professional info</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'personal', label: 'Personal', icon: FiUser },
          { id: 'professional', label: 'Professional', icon: FiSettings },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'personal' && (
        <form onSubmit={handleSavePersonal} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'professional' && (
        <form onSubmit={handleSaveDoctor} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input type="text" value={doctor.specialization} onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input type="text" value={doctor.qualification} onChange={(e) => setDoctor({ ...doctor, qualification: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input type="number" value={doctor.experience} onChange={(e) => setDoctor({ ...doctor, experience: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
              <input type="number" value={doctor.consultationFee} onChange={(e) => setDoctor({ ...doctor, consultationFee: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={doctor.isAvailable} onChange={(e) => setDoctor({ ...doctor, isAvailable: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
            <span className="text-sm text-gray-700">Available for appointments</span>
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
