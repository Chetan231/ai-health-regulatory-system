import { useState, useEffect } from 'react';
import { getBeds, getBedStats, createBed, updateBed, deleteBed, getDepartments } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLayers } from 'react-icons/fi';

const statusColors = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-red-100 text-red-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
};

const typeLabels = { general: 'General', icu: 'ICU', private: 'Private', 'semi-private': 'Semi-Private' };

const Beds = () => {
  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ bedNumber: '', departmentId: '', type: 'general', status: 'available', dailyRate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, [filterDept, filterStatus]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterStatus) params.status = filterStatus;

      const [bedsRes, statsRes, deptsRes] = await Promise.all([
        getBeds(params),
        getBedStats(),
        getDepartments(),
      ]);
      setBeds(bedsRes.data.data.beds);
      setStats(statsRes.data.data.stats);
      setDepartments(deptsRes.data.data.departments);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ bedNumber: '', departmentId: departments[0]?._id || '', type: 'general', status: 'available', dailyRate: '' }); setShowForm(true); };
  const openEdit = (b) => {
    setEditing(b._id);
    setForm({ bedNumber: b.bedNumber, departmentId: b.departmentId?._id || '', type: b.type, status: b.status, dailyRate: b.dailyRate || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.bedNumber || !form.departmentId) return toast.error('Bed number and department are required');
    setSaving(true);
    try {
      const payload = { ...form, dailyRate: form.dailyRate ? Number(form.dailyRate) : 0 };
      if (editing) {
        await updateBed(editing, payload);
        toast.success('Bed updated');
      } else {
        await createBed(payload);
        toast.success('Bed created');
      }
      setShowForm(false);
      loadAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bed?')) return;
    try { await deleteBed(id); toast.success('Bed deleted'); loadAll(); }
    catch (err) { toast.error('Failed'); }
  };

  const getStatCount = (status) => stats.find((s) => s._id === status)?.count || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bed Management</h1>
          <p className="text-gray-500 mt-1">Track and manage hospital beds</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition">
          <FiPlus className="w-4 h-4" /> Add Bed
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available', count: getStatCount('available'), color: 'green' },
          { label: 'Occupied', count: getStatCount('occupied'), color: 'red' },
          { label: 'Maintenance', count: getStatCount('maintenance'), color: 'yellow' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-5 border ${
            s.color === 'green' ? 'bg-green-50 border-green-100' :
            s.color === 'red' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
          }`}>
            <p className="text-3xl font-bold text-gray-900">{s.count}</p>
            <p className="text-sm text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-white">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-white">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Beds Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>
      ) : beds.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiLayers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No beds found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {beds.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold text-gray-900">{b.bedNumber}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
              </div>
              <p className="text-xs text-gray-500">{b.departmentId?.name}</p>
              <p className="text-xs text-gray-500">{typeLabels[b.type]} • ₹{b.dailyRate}/day</p>
              {b.patientId && <p className="text-xs text-blue-600 mt-1">Patient: {b.patientId.name}</p>}
              <div className="flex gap-1 mt-3">
                <button onClick={() => openEdit(b)} className="flex-1 py-1.5 text-xs text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition">Edit</button>
                <button onClick={() => handleDelete(b._id)} className="py-1.5 px-2 text-xs text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
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
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit' : 'Add'} Bed</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number *</label>
                <input type="text" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} placeholder="e.g. ICU-01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white">
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none bg-white">
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₹)</label>
                <input type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Bed' : 'Create Bed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beds;
