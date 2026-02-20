import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheck, FiHeart } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient: '', diagnosis: '', notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/doctors/my-patients');
        setPatients(data || []);
      } catch (err) {
        console.error('Failed to load patients:', err);
        toast.error('Failed to load patients list');
      }
    };
    fetchPatients();
  }, []);

  const addMed = () => {
    setForm({ ...form, medications: [...form.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
  };

  const removeMed = (index) => {
    setForm({ ...form, medications: form.medications.filter((_, i) => i !== index) });
  };

  const updateMed = (index, field, value) => {
    const updated = [...form.medications];
    updated[index][field] = value;
    setForm({ ...form, medications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.diagnosis) return toast.error('Patient and diagnosis required');
    
    // Filter out empty medications and validate
    const validMeds = form.medications.filter(m => m.name && m.dosage && m.frequency && m.duration);
    if (validMeds.length === 0) return toast.error('Add at least one medication with all fields filled');
    
    setLoading(true);
    try {
      await api.post('/prescriptions', { ...form, medications: validMeds });
      toast.success('Prescription created!');
      navigate('/doctor/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create <span className="gradient-text">Prescription</span></h1>
        <p className="text-gray-400 mt-1">Write a prescription for your patient</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-6 space-y-4">
          <h3 className="text-white font-semibold">Patient & Diagnosis</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Patient</label>
              <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary">
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.user?._id} value={p.user?._id}>{p.user?.name}</option>)}
              </select>
            </div>
            <Input label="Diagnosis" placeholder="Upper Respiratory Infection" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Additional notes..." className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary resize-none" />
          </div>
        </motion.div>

        {/* Medications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Medications</h3>
            <Button type="button" size="sm" variant="secondary" onClick={addMed}>
              <FiPlus size={14} /> Add Medication
            </Button>
          </div>

          <AnimatePresence>
            {form.medications.map((med, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-white/[0.02] rounded-xl border border-white/5 mb-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>💊</motion.span>
                    Medication {i + 1}
                  </span>
                  {form.medications.length > 1 && (
                    <motion.button type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={() => removeMed(i)} className="p-1.5 rounded-lg hover:bg-danger/10 text-gray-500 hover:text-danger">
                      <FiTrash2 size={13} />
                    </motion.button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} placeholder="Amoxicillin" className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                  <input value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} placeholder="500mg" className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                  <input value={med.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} placeholder="Twice daily" className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                  <input value={med.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} placeholder="7 days" className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                </div>
                <input value={med.instructions} onChange={(e) => updateMed(i, 'instructions', e.target.value)} placeholder="Take after meals with water" className="mt-2 w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}><FiCheck size={16} /> Create Prescription</Button>
        </div>
      </form>
    </AnimatedPage>
  );
};

export default CreatePrescription;
