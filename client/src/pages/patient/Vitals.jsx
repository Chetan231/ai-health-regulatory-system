import { useState, useEffect } from 'react';
import { recordVitals, getVitals, getVitalsAnalytics, deleteVitals } from '../../api/vitalsApi';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTrendingUp, FiList, FiAlertTriangle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Vitals = () => {
  const [tab, setTab] = useState('record'); // record | history | charts
  const [vitals, setVitals] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [averages, setAverages] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    systolic: '', diastolic: '', heartRate: '', temperature: '',
    oxygenSaturation: '', weight: '', fastingSugar: '', postMealSugar: '',
    respiratoryRate: '', notes: '',
  });

  useEffect(() => {
    if (tab === 'history') loadHistory();
    if (tab === 'charts') loadAnalytics();
  }, [tab]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getVitals({ limit: 50 });
      setVitals(res.data.data.vitals);
    } catch (err) {
      toast.error('Failed to load vitals');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getVitalsAnalytics(30);
      setChartData(res.data.data.chartData);
      setAverages(res.data.data.averages);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {};
      if (form.systolic || form.diastolic) {
        payload.bloodPressure = {};
        if (form.systolic) payload.bloodPressure.systolic = Number(form.systolic);
        if (form.diastolic) payload.bloodPressure.diastolic = Number(form.diastolic);
      }
      if (form.heartRate) payload.heartRate = Number(form.heartRate);
      if (form.temperature) payload.temperature = Number(form.temperature);
      if (form.oxygenSaturation) payload.oxygenSaturation = Number(form.oxygenSaturation);
      if (form.weight) payload.weight = Number(form.weight);
      if (form.respiratoryRate) payload.respiratoryRate = Number(form.respiratoryRate);
      if (form.fastingSugar || form.postMealSugar) {
        payload.bloodSugar = {};
        if (form.fastingSugar) payload.bloodSugar.fasting = Number(form.fastingSugar);
        if (form.postMealSugar) payload.bloodSugar.postMeal = Number(form.postMealSugar);
      }
      if (form.notes) payload.notes = form.notes;

      const res = await recordVitals(payload);
      const alerts = res.data.data.vitals.alerts || [];

      if (alerts.length > 0) {
        alerts.forEach((a) => {
          if (a.severity === 'critical') toast.error(`⚠️ ${a.message}`);
          else toast(a.message, { icon: '⚠️' });
        });
      } else {
        toast.success('Vitals recorded successfully!');
      }

      setForm({ systolic: '', diastolic: '', heartRate: '', temperature: '', oxygenSaturation: '', weight: '', fastingSugar: '', postMealSugar: '', respiratoryRate: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vitals record?')) return;
    try {
      await deleteVitals(id);
      setVitals(vitals.filter((v) => v._id !== id));
      toast.success('Record deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vitals Monitoring</h1>
        <p className="text-gray-500 mt-1">Record, track, and analyze your health vitals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'record', label: 'Record', icon: FiPlus },
          { id: 'history', label: 'History', icon: FiList },
          { id: 'charts', label: 'Charts', icon: FiTrendingUp },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Record Tab */}
      {tab === 'record' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Record New Vitals</h2>
          <p className="text-sm text-gray-500 -mt-4">Fill in the measurements you have. All fields are optional.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Systolic BP (mmHg)</label>
              <input type="number" name="systolic" value={form.systolic} onChange={handleChange} placeholder="120"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diastolic BP (mmHg)</label>
              <input type="number" name="diastolic" value={form.diastolic} onChange={handleChange} placeholder="80"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
              <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="72"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
              <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} placeholder="98.6"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SpO₂ (%)</label>
              <input type="number" name="oxygenSaturation" value={form.oxygenSaturation} onChange={handleChange} placeholder="98"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} placeholder="70"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasting Blood Sugar (mg/dL)</label>
              <input type="number" name="fastingSugar" value={form.fastingSugar} onChange={handleChange} placeholder="90"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Post-Meal Sugar (mg/dL)</label>
              <input type="number" name="postMealSugar" value={form.postMealSugar} onChange={handleChange} placeholder="140"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Rate (/min)</label>
              <input type="number" name="respiratoryRate" value={form.respiratoryRate} onChange={handleChange} placeholder="16"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Any additional notes..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
          </div>

          <button type="submit" disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {submitting ? 'Recording...' : 'Record Vitals'}
          </button>
        </form>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vitals History</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : vitals.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No vitals recorded yet. Start by recording your first reading!</p>
          ) : (
            <div className="space-y-3">
              {vitals.map((v) => (
                <div key={v._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap gap-3">
                      {v.bloodPressure?.systolic && (
                        <span className="text-sm"><span className="text-gray-500">BP:</span> <strong>{v.bloodPressure.systolic}/{v.bloodPressure.diastolic}</strong></span>
                      )}
                      {v.heartRate && <span className="text-sm"><span className="text-gray-500">HR:</span> <strong>{v.heartRate}</strong> bpm</span>}
                      {v.temperature && <span className="text-sm"><span className="text-gray-500">Temp:</span> <strong>{v.temperature}</strong>°F</span>}
                      {v.oxygenSaturation && <span className="text-sm"><span className="text-gray-500">SpO₂:</span> <strong>{v.oxygenSaturation}</strong>%</span>}
                      {v.weight && <span className="text-sm"><span className="text-gray-500">Weight:</span> <strong>{v.weight}</strong> kg</span>}
                      {v.bloodSugar?.fasting && <span className="text-sm"><span className="text-gray-500">Sugar(F):</span> <strong>{v.bloodSugar.fasting}</strong></span>}
                    </div>
                    <button onClick={() => handleDelete(v._id)} className="text-gray-300 hover:text-red-500 transition p-1">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {v.alerts?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {v.alerts.map((a, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          a.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          <FiAlertTriangle className="w-3 h-3" /> {a.message}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(v.recordedAt)}</p>
                  {v.notes && <p className="text-xs text-gray-500 mt-1 italic">{v.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Charts Tab */}
      {tab === 'charts' && (
        <div className="space-y-6">
          {/* Averages */}
          {averages && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Avg Heart Rate', value: averages.heartRate, unit: 'bpm', color: 'pink' },
                { label: 'Avg Systolic BP', value: averages.systolicBP, unit: 'mmHg', color: 'red' },
                { label: 'Avg SpO₂', value: averages.oxygenSaturation, unit: '%', color: 'blue' },
              ].map((a, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-500">{a.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{a.value ?? '—'} <span className="text-sm font-normal text-gray-400">{a.value ? a.unit : ''}</span></p>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              Not enough data for charts. Record a few days of vitals first!
            </div>
          ) : (
            <>
              {/* Blood Pressure Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure (30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Line type="monotone" dataKey="diastolic" stroke="#f97316" name="Diastolic" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Heart Rate & SpO2 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Heart Rate & SpO₂ (30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <Legend />
                    <Line type="monotone" dataKey="heartRate" stroke="#ec4899" name="Heart Rate" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    <Line type="monotone" dataKey="oxygenSaturation" stroke="#3b82f6" name="SpO₂" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Weight */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Trend (30 Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <Line type="monotone" dataKey="weight" stroke="#22c55e" name="Weight (kg)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Vitals;
