import { useState, useEffect } from 'react';
import { getLabReports, createLabReport, reportSummary } from '../../api/aiApi';
import toast from 'react-hot-toast';
import { FiPlus, FiFileText, FiCpu, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const typeLabels = { blood: '🩸 Blood', urine: '🧪 Urine', xray: '📷 X-Ray', mri: '🧲 MRI', ct: '🔬 CT Scan', ecg: '💓 ECG', other: '📋 Other' };

const LabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [summarizing, setSummarizing] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'blood', results: '', labName: '', date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLabReports();
      setReports(res.data.data.reports);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title) return toast.error('Title is required');
    setSaving(true);
    try {
      await createLabReport(form);
      toast.success('Report added');
      setShowCreate(false);
      setForm({ title: '', type: 'blood', results: '', labName: '', date: '' });
      load();
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleSummarize = async (id) => {
    setSummarizing(id);
    try {
      const res = await reportSummary({ reportId: id });
      // Update the report in list
      setReports(reports.map((r) => r._id === id ? { ...r, aiSummary: JSON.stringify(res.data.data.summary) } : r));
      toast.success('AI summary generated!');
    } catch (err) { toast.error('Failed to summarize'); }
    finally { setSummarizing(null); }
  };

  const parseSummary = (s) => {
    try { return JSON.parse(s); } catch { return null; }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Lab Reports</h1>
          <p className="text-gray-500 mt-1">View reports and get AI-powered summaries</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
          <FiPlus className="w-4 h-4" /> Add Report
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No lab reports yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const summary = parseSummary(r.aiSummary);
            return (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                      {typeLabels[r.type]?.split(' ')[0] || '📋'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{r.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                        <span>{typeLabels[r.type]?.split(' ').slice(1).join(' ') || r.type}</span>
                        <span>{formatDate(r.date)}</span>
                        {r.labName && <span>{r.labName}</span>}
                        {r.aiSummary && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">AI Summary</span>}
                      </div>
                    </div>
                  </div>
                  {expanded === r._id ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {expanded === r._id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {r.results && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Results</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl">{r.results}</p>
                      </div>
                    )}

                    {/* AI Summary */}
                    {summary ? (
                      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-3">
                        <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-1"><FiCpu className="w-4 h-4" /> AI Summary</h4>
                        {summary.summary && <p className="text-sm text-gray-700">{summary.summary}</p>}
                        {summary.keyFindings && (
                          <div className="space-y-1">
                            {summary.keyFindings.map((f, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{f.parameter}: {f.value}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  f.status === 'normal' ? 'bg-green-100 text-green-700' :
                                  f.status === 'watch' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>{f.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {summary.overallAssessment && <p className="text-sm text-gray-600 italic">{summary.overallAssessment}</p>}
                      </div>
                    ) : (
                      <button onClick={() => handleSummarize(r._id)} disabled={summarizing === r._id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50">
                        {summarizing === r._id ? <><div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div> Summarizing...</> : <><FiCpu className="w-4 h-4" /> Generate AI Summary</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Lab Report</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete Blood Count"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name</label>
                <input type="text" value={form.labName} onChange={(e) => setForm({ ...form, labName: e.target.value })} placeholder="e.g. Apollo Diagnostics"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Results (paste report text)</label>
                <textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} rows={4} placeholder="Paste your lab results here..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <button onClick={handleCreate} disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabReports;
