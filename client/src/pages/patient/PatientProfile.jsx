import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiHeart, FiDroplet, FiAlertTriangle, FiPhone, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other'];

const PatientProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/patients/profile');
      setProfile(data);
      setForm(data);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/patients/profile', form);
      setProfile(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const InfoRow = ({ icon: Icon, label, value, color = 'text-primary' }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all"
    >
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-white font-medium">{value || 'Not set'}</p>
      </div>
    </motion.div>
  );

  if (loading) return <div className="shimmer h-96 rounded-2xl" />;

  return (
    <AnimatedPage>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Profile</span></h1>
          <p className="text-gray-400 mt-1">Manage your health information</p>
        </motion.div>
        <Button
          variant={editing ? 'danger' : 'secondary'}
          onClick={() => { setEditing(!editing); setForm(profile); }}
        >
          {editing ? <><FiX size={16} /> Cancel</> : <><FiEdit2 size={16} /> Edit Profile</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-light rounded-2xl border border-white/10 p-6 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white mb-4"
          >
            {user?.name?.[0]?.toUpperCase()}
          </motion.div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="mt-4 flex justify-center gap-3">
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
            >
              {profile?.bloodGroup || 'Blood Group N/A'}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full border border-secondary/20 capitalize"
            >
              {profile?.gender || 'Gender N/A'}
            </motion.span>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-dark-light rounded-2xl border border-white/10 p-6"
        >
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Edit Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Date of Birth" type="date" value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''} onChange={update('dateOfBirth')} />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Gender</label>
                    <select value={form.gender || ''} onChange={update('gender')} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary">
                      <option value="">Select</option>
                      {genders.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">Blood Group</label>
                    <select value={form.bloodGroup || ''} onChange={update('bloodGroup')} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary">
                      <option value="">Select</option>
                      {bloodGroups.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <Input label="Height (cm)" type="number" value={form.height || ''} onChange={update('height')} />
                  <Input label="Weight (kg)" type="number" value={form.weight || ''} onChange={update('weight')} />
                  <Input label="Address" value={form.address || ''} onChange={update('address')} />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Allergies (comma separated)</label>
                  <input
                    value={Array.isArray(form.allergies) ? form.allergies.join(', ') : ''}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full mt-1.5 bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                    placeholder="Penicillin, Peanuts..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300">Chronic Conditions (comma separated)</label>
                  <input
                    value={Array.isArray(form.chronicConditions) ? form.chronicConditions.join(', ') : ''}
                    onChange={(e) => setForm({ ...form, chronicConditions: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full mt-1.5 bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                    placeholder="Diabetes, Hypertension..."
                  />
                </div>

                <h4 className="text-md font-semibold text-white pt-2">Emergency Contact</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input label="Name" value={form.emergencyContact?.name || ''} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
                  <Input label="Phone" value={form.emergencyContact?.phone || ''} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
                  <Input label="Relation" value={form.emergencyContact?.relation || ''} onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })} />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} loading={saving}>
                    <FiSave size={16} /> Save Changes
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-lg font-semibold text-white mb-4">Health Information</h3>
                <div className="grid md:grid-cols-2 gap-1">
                  <InfoRow icon={FiUser} label="Gender" value={profile?.gender} />
                  <InfoRow icon={FiDroplet} label="Blood Group" value={profile?.bloodGroup} color="text-danger" />
                  <InfoRow icon={FiUser} label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null} />
                  <InfoRow icon={FiUser} label="Height" value={profile?.height ? `${profile.height} cm` : null} />
                  <InfoRow icon={FiUser} label="Weight" value={profile?.weight ? `${profile.weight} kg` : null} />
                  <InfoRow icon={FiUser} label="Address" value={profile?.address} />
                </div>

                {profile?.allergies?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies.map((a, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                          className="px-3 py-1 bg-danger/10 text-danger text-xs rounded-full border border-danger/20"
                        >
                          <FiAlertTriangle size={10} className="inline mr-1" /> {a}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.emergencyContact?.name && (
                  <div className="mt-4 p-3 bg-white/[0.02] rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Emergency Contact</p>
                    <p className="text-sm text-white">{profile.emergencyContact.name} ({profile.emergencyContact.relation})</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><FiPhone size={10} /> {profile.emergencyContact.phone}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default PatientProfile;
