import { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiGrid } from 'react-icons/fi';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      setDepartments(res.data.data.departments);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true); };
  const openEdit = (d) => { setEditing(d._id); setForm({ name: d.name, description: d.description || '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await updateDepartment(editing, form);
        toast.success('Department updated');
      } else {
        await createDepartment(form);
        toast.success('Department created');
      }
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try {
      await deleteDepartment(id);
      toast.success('Department deleted');
      load();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage hospital departments</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition">
          <FiPlus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No departments yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{d.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {d.description && <p className="text-sm text-gray-500 mt-1">{d.description}</p>}
                  {d.headDoctorId && <p className="text-xs text-violet-600 mt-1">Head: Dr. {d.headDoctorId.name}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(d._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit' : 'New'} Department</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Department description..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Department' : 'Create Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
