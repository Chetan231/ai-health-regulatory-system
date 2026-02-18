import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/admin/departments');
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Department name required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/departments/${editing}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/admin/departments', form);
        toast.success('Department created');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const openEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '' });
    setEditing(dept._id);
    setShowModal(true);
  };

  if (loading) return <Loader text="Loading departments..." />;

  return (
    <AnimatedPage>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">Manage <span className="gradient-text">Departments</span></h1>
          <p className="text-gray-400 mt-1">{departments.length} departments</p>
        </motion.div>
        <Button onClick={() => { setForm({ name: '', description: '' }); setEditing(null); setShowModal(true); }}>
          <FiPlus size={16} /> Add Department
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept, i) => (
          <motion.div
            key={dept._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-dark-light rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <motion.div whileHover={{ rotate: 10 }} className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                <FiGrid size={20} />
              </motion.div>
              <div className="flex gap-1">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-primary">
                  <FiEdit2 size={14} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-gray-400 hover:text-danger">
                  <FiTrash2 size={14} />
                </motion.button>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">{dept.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{dept.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Head: {dept.headDoctor?.name || 'Not assigned'}</span>
              <span className={`px-2 py-0.5 rounded-full ${dept.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {dept.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} onClick={(e) => e.stopPropagation()} className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">{editing ? 'Edit' : 'Add'} Department</h3>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><FiX size={20} /></motion.button>
              </div>
              <div className="space-y-4">
                <Input label="Name" placeholder="e.g. Cardiology" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Department description..." className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary resize-none" />
                </div>
                <Button onClick={handleSave} loading={saving} className="w-full">
                  <FiCheck size={16} /> {editing ? 'Update' : 'Create'} Department
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default ManageDepartments;
