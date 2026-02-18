import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiFileText, FiCheck, FiX } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const reportTypes = ['blood-test', 'cbc', 'lipid-panel', 'ecg', 'imaging', 'x-ray', 'mri', 'ct-scan', 'thyroid', 'liver', 'kidney', 'urine-test', 'other'];
const statusOptions = ['normal', 'low', 'high', 'critical'];

const CreateReport = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient: '', type: 'blood-test', title: '', description: '',
    results: [{ parameter: '', value: '', unit: '', normalRange: '', status: 'normal' }],
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/doctors/my-patients');
        setPatients(data);
      } catch (err) {}
    };
    fetchPatients();
  }, []);

  const addResult = () => {
    setForm({ ...form, results: [...form.results, { parameter: '', value: '', unit: '', normalRange: '', status: 'normal' }] });
  };

  const removeResult = (index) => {
    setForm({ ...form, results: form.results.filter((_, i) => i !== index) });
  };

  const updateResult = (index, field, value) => {
    const updated = [...form.results];
    updated[index][field] = value;
    setForm({ ...form, results: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient || !form.title) return toast.error('Patient and title required');
    setLoading(true);
    try {
      await api.post('/reports', form);
      toast.success('Report created!');
      navigate('/doctor/reports');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create <span className="gradient-text">Report</span></h1>
        <p className="text-gray-400 mt-1">Add medical report for a patient</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-6 space-y-4">
          <h3 className="text-white font-semibold">Basic Information</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Patient</label>
              <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary">
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.user?._id} value={p.user?._id}>{p.user?.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Report Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary capitalize">
                {reportTypes.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
              </select>
            </div>
          </div>

          <Input label="Title" placeholder="Complete Blood Count Report" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Report description..." className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary resize-none" />
          </div>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Test Results</h3>
            <Button type="button" size="sm" variant="secondary" onClick={addResult}>
              <FiPlus size={14} /> Add Parameter
            </Button>
          </div>

          <AnimatePresence>
            {form.results.map((result, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-12 gap-2 mb-3 items-end"
              >
                <div className="col-span-3">
                  {i === 0 && <label className="text-[10px] text-gray-500 mb-1 block">Parameter</label>}
                  <input value={result.parameter} onChange={(e) => updateResult(i, 'parameter', e.target.value)} placeholder="Hemoglobin" className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="text-[10px] text-gray-500 mb-1 block">Value</label>}
                  <input value={result.value} onChange={(e) => updateResult(i, 'value', e.target.value)} placeholder="14.5" className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="text-[10px] text-gray-500 mb-1 block">Unit</label>}
                  <input value={result.unit} onChange={(e) => updateResult(i, 'unit', e.target.value)} placeholder="g/dL" className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="text-[10px] text-gray-500 mb-1 block">Normal Range</label>}
                  <input value={result.normalRange} onChange={(e) => updateResult(i, 'normalRange', e.target.value)} placeholder="12-16" className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-primary" />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="text-[10px] text-gray-500 mb-1 block">Status</label>}
                  <select value={result.status} onChange={(e) => updateResult(i, 'status', e.target.value)} className="w-full bg-dark border border-white/10 rounded-lg px-2 py-2 text-white text-xs outline-none focus:border-primary capitalize">
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  {form.results.length > 1 && (
                    <motion.button type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={() => removeResult(i)} className="p-2 rounded-lg hover:bg-danger/10 text-gray-500 hover:text-danger">
                      <FiTrash2 size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}><FiCheck size={16} /> Create Report</Button>
        </div>
      </form>
    </AnimatedPage>
  );
};

export default CreateReport;
