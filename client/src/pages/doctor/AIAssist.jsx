import { useState } from 'react';
import { diagnosisAssist } from '../../api/aiApi';
import toast from 'react-hot-toast';
import { FiCpu, FiSend, FiAlertTriangle } from 'react-icons/fi';

const AIAssist = () => {
  const [symptoms, setSymptoms] = useState('');
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return toast.error('Please enter symptoms');
    setLoading(true); setResult(null);
    try {
      const res = await diagnosisAssist({ symptoms, patientId: patientId || undefined });
      setResult(res.data.data.suggestions);
    } catch (err) { toast.error('AI analysis failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiCpu className="text-emerald-600" /> AI Diagnosis Assistant
        </h1>
        <p className="text-gray-500 mt-1">AI-powered clinical decision support — always verify with your expertise</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Symptoms</label>
          <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={4}
            placeholder="Enter patient's symptoms, observations, and relevant findings..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID (optional — for history context)</label>
          <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Paste patient's user ID for vitals context"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <button onClick={handleAnalyze} disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
          {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Analyzing...</> : <><FiSend className="w-4 h-4" /> Get AI Suggestions</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Differential Diagnosis */}
          {result.differentialDiagnosis && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Differential Diagnosis</h3>
              <div className="space-y-3">
                {result.differentialDiagnosis.map((d, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{d.condition}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        d.likelihood === 'High' ? 'bg-red-100 text-red-700' :
                        d.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>{d.likelihood}</span>
                    </div>
                    <p className="text-sm text-gray-600">{d.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tests */}
          {result.suggestedTests && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Suggested Tests</h3>
              <div className="flex flex-wrap gap-2">
                {result.suggestedTests.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Treatment Suggestions */}
          {result.treatmentSuggestions && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Treatment Suggestions</h3>
              <ul className="space-y-2">
                {result.treatmentSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-emerald-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Red Flags */}
          {result.redFlags && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-1"><FiAlertTriangle className="w-4 h-4" /> Red Flags</h3>
              <ul className="space-y-1">
                {result.redFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span>⚠️</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <FiAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              This is an AI-generated clinical decision support. Always apply your professional medical judgment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssist;
