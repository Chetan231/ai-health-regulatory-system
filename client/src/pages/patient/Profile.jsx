import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPatientProfile, updatePatientProfile } from '../../api/patientApi';
import { updateProfile as updateUserProfile } from '../../api/authApi';
import toast from 'react-hot-toast';
import { FiSave, FiUser, FiHeart } from 'react-icons/fi';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('personal');

  const [personal, setPersonal] = useState({ name: '', phone: '' });
  const [health, setHealth] = useState({
    dateOfBirth: '', gender: '', bloodGroup: '', height: '', weight: '',
    allergies: '', chronicConditions: '',
  });
  const [emergency, setEmergency] = useState({ name: '', phone: '', relation: '' });
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getPatientProfile();
      const { user: u, profile: p } = res.data.data;

      setPersonal({ name: u.name || '', phone: u.phone || '' });
      if (p) {
        setHealth({
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
          gender: p.gender || '',
          bloodGroup: p.bloodGroup || '',
          height: p.height || '',
          weight: p.weight || '',
          allergies: p.allergies?.join(', ') || '',
          chronicConditions: p.chronicConditions?.join(', ') || '',
        });
        if (p.emergencyContact) setEmergency(p.emergencyContact);
        if (p.address) setAddress(p.address);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveHealth = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...health,
        height: health.height ? Number(health.height) : undefined,
        weight: health.weight ? Number(health.weight) : undefined,
        allergies: health.allergies ? health.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        chronicConditions: health.chronicConditions ? health.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        emergencyContact: emergency,
        address,
      };
      await updatePatientProfile(payload);
      toast.success('Health profile updated');
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal and health information</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'personal', label: 'Personal', icon: FiUser },
          { id: 'health', label: 'Health Info', icon: FiHeart },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Personal Tab */}
      {tab === 'personal' && (
        <form onSubmit={handleSavePersonal} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email} disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
          </div>

          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Health Tab */}
      {tab === 'health' && (
        <form onSubmit={handleSaveHealth} className="space-y-6">
          {/* Health Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Health Details</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={health.dateOfBirth} onChange={(e) => setHealth({ ...health, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={health.gender} onChange={(e) => setHealth({ ...health, gender: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select value={health.bloodGroup} onChange={(e) => setHealth({ ...health, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input type="number" value={health.height} onChange={(e) => setHealth({ ...health, height: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input type="number" value={health.weight} onChange={(e) => setHealth({ ...health, weight: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma-separated)</label>
              <input type="text" value={health.allergies} onChange={(e) => setHealth({ ...health, allergies: e.target.value })} placeholder="Penicillin, Peanuts"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions (comma-separated)</label>
              <input type="text" value={health.chronicConditions} onChange={(e) => setHealth({ ...health, chronicConditions: e.target.value })} placeholder="Diabetes, Hypertension"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" value={emergency.name} onChange={(e) => setEmergency({ ...emergency, name: e.target.value })} placeholder="Contact Name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              <input type="tel" value={emergency.phone} onChange={(e) => setEmergency({ ...emergency, phone: e.target.value })} placeholder="Phone"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              <input type="text" value={emergency.relation} onChange={(e) => setEmergency({ ...emergency, relation: e.target.value })} placeholder="Relation"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              <input type="text" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              <input type="text" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} placeholder="ZIP Code"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Health Info'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
