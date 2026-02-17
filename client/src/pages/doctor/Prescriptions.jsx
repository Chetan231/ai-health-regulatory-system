import { useState, useEffect } from 'react';
import { getPrescriptions, createPrescription } from '../../api/prescriptionApi';
import { getMyPatients } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { FiPlus, FiFileText, FiTrash2, FiX, FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // Create form
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPrescriptions();
      setPrescriptions(res.data.data.prescriptions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = async () => {
    setShowCreate(true);
    try {
      const res = await getMyPatients({ limit: 100 });
      setPatients(res.data.data.patients);
    } catch (err) { toast.error('Failed to load patients'); }
  };

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i, field, value) => {
    const updated = [...medicines];
    updated[i] = { ...updated[i], [field]: value };
    setMedicines(updated);
  };

  const handleCreate = async () => {
    if (!selectedPatient) return toast.error('Select a patient');
    if (medicines.some((m) => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      return toast.error('Fill all required medicine fields');
    }
    setCreating(true);
    try {
      await createPrescription({ patientId: selectedPatient._id, medicines, diagnosis, notes });
      toast.success('Prescription created');
      setShowCreate(false);
      resetForm();
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const resetForm = () => {
    setSelectedPatient(null); setDiagnosis(''); setNotes(''); setPatientSearch('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredPatients = patients.filter((p) =>
    p.user.name?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 mt-1">Create and manage prescriptions</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
          <FiPlus className="w-4 h-4" /> New Prescription
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                    {p.patientId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.patientId?.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span>{formatDate(p.createdAt)}</span>
                      <span>{p.medicines.length} medicine{p.medicines.length > 1 ? 's' : ''}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {p.diagnosis && <p className="text-sm text-emerald-600 mt-0.5">{p.diagnosis}</p>}
                  </div>
                </div>
                {expanded === p._id ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expanded === p._id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Medicine</th>
                        <th className="pb-2 font-medium">Dosage</th>
                        <th className="pb-2 font-medium">Frequency</th>
                        <th className="pb-2 font-medium">Duration</th>
                        <th className="pb-2 font-medium">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.medicines.map((m, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2.5 font-medium text-gray-900">{m.name}</td>
                          <td className="py-2.5 text-gray-600">{m.dosage}</td>
                          <td className="py-2.5 text-gray-600">{m.frequency}</td>
                          <td className="py-2.5 text-gray-600">{m.duration}</td>
                          <td className="py-2.5 text-gray-500 text-xs">{m.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {p.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                      <p className="text-xs font-medium text-yellow-700">Notes:</p>
                      <p className="text-sm text-gray-700 mt-0.5">{p.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">New Prescription</h2>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>

            {/* Patient */}
            {!selectedPatient ? (
              <div className="space-y-3 mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Patient</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} placeholder="Search patients..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filteredPatients.map((p) => (
                    <button key={p.user._id} onClick={() => setSelectedPatient(p.user)}
                      className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-emerald-50 rounded-lg transition">
                      <span className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                        {p.user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      {p.user.name} — <span className="text-gray-400">{p.user.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl mb-4">
                <span className="font-medium text-sm text-gray-900">{selectedPatient.name}</span>
                <button onClick={() => setSelectedPatient(null)} className="text-xs text-blue-600 hover:underline ml-auto">Change</button>
              </div>
            )}

            {/* Diagnosis */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Upper respiratory tract infection"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            {/* Medicines */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Medicines</label>
                <button onClick={addMedicine} className="text-xs text-emerald-600 hover:underline flex items-center gap-1"><FiPlus className="w-3 h-3" /> Add</button>
              </div>
              <div className="space-y-3">
                {medicines.map((m, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Medicine #{i + 1}</span>
                      {medicines.length > 1 && (
                        <button onClick={() => removeMedicine(i)} className="text-gray-300 hover:text-red-500"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={m.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)} placeholder="Medicine name *"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input type="text" value={m.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)} placeholder="Dosage (e.g. 500mg) *"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input type="text" value={m.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)} placeholder="Frequency (e.g. 2x/day) *"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      <input type="text" value={m.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)} placeholder="Duration (e.g. 5 days) *"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <input type="text" value={m.instructions} onChange={(e) => updateMedicine(i, 'instructions', e.target.value)} placeholder="Special instructions (optional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
            </div>

            <button onClick={handleCreate} disabled={creating || !selectedPatient}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
