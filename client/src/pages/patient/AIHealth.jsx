import { useState } from 'react';
import { symptomCheck, riskAssessment, healthTips } from '../../api/aiApi';
import toast from 'react-hot-toast';
import { FiCpu, FiActivity, FiHeart, FiAlertTriangle, FiSend, FiZap, FiShield } from 'react-icons/fi';

const AIHealth = () => {
  const [tab, setTab] = useState('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSymptomCheck = async () => {
    if (!symptoms.trim()) return toast.error('Please describe your symptoms');
    setLoading(true); setResult(null);
    try {
      const res = await symptomCheck({ symptoms });
      setResult({ type: 'symptoms', data: res.data.data.analysis });
    } catch (err) { toast.error('AI analysis failed'); }
    finally { setLoading(false); }
  };

  const handleRiskAssessment = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await riskAssessment({});
      setResult({ type: 'risk', data: res.data.data.assessment });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleHealthTips = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await healthTips();
      setResult({ type: 'tips', data: res.data.data.tips });
    } catch (err) { toast.error('Failed to get tips'); }
    finally { setLoading(false); }
  };

  const urgencyColors = { low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', emergency: 'bg-red-100 text-red-700' };
  const riskColors = { Low: 'text-green-600', Moderate: 'text-yellow-600', High: 'text-orange-600', Critical: 'text-red-600' };
  const priorityColors = { high: 'bg-red-50 border-red-200', medium: 'bg-yellow-50 border-yellow-200', low: 'bg-blue-50 border-blue-200' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiCpu className="text-blue-600" /> AI Health Assistant
        </h1>
        <p className="text-gray-500 mt-1">AI-powered health insights — not a replacement for medical advice</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'symptoms', label: 'Symptom Checker', icon: FiActivity },
          { id: 'risk', label: 'Risk Assessment', icon: FiShield },
          { id: 'tips', label: 'Health Tips', icon: FiHeart },
        ].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}><t.icon className="w-4 h-4" /> {t.label}</button>
        ))}
      </div>

      {/* Symptom Checker */}
      {tab === 'symptoms' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">🔍 AI Symptom Checker</h2>
          <p className="text-sm text-gray-500">Describe your symptoms in detail and our AI will analyze possible conditions.</p>
          <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={4}
            placeholder="e.g., I've been having a persistent headache for 3 days, along with mild fever and sore throat..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          <button onClick={handleSymptomCheck} disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Analyzing...</> : <><FiSend className="w-4 h-4" /> Analyze Symptoms</>}
          </button>
        </div>
      )}

      {/* Risk Assessment */}
      {tab === 'risk' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">🛡️ Health Risk Assessment</h2>
          <p className="text-sm text-gray-500">AI analyzes your vitals history and profile to predict potential health risks.</p>
          <button onClick={handleRiskAssessment} disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Assessing...</> : <><FiZap className="w-4 h-4" /> Run Assessment</>}
          </button>
        </div>
      )}

      {/* Health Tips */}
      {tab === 'tips' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">💡 Personalized Health Tips</h2>
          <p className="text-sm text-gray-500">Get AI-generated health recommendations based on your profile and vitals.</p>
          <button onClick={handleHealthTips} disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Generating...</> : <><FiHeart className="w-4 h-4" /> Get Tips</>}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Symptom Results */}
          {result.type === 'symptoms' && result.data && (
            <>
              {result.data.urgency && (
                <div className={`p-4 rounded-xl ${urgencyColors[result.data.urgency] || 'bg-gray-100'}`}>
                  <p className="font-medium">Urgency: <span className="uppercase">{result.data.urgency}</span></p>
                </div>
              )}

              {result.data.possibleConditions && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Possible Conditions</h3>
                  <div className="space-y-3">
                    {result.data.possibleConditions.map((c, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{c.name}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            c.probability === 'High' ? 'bg-red-100 text-red-700' :
                            c.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>{c.probability} probability</span>
                        </div>
                        <p className="text-sm text-gray-600">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.data.recommendations && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {result.data.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-500 mt-0.5">✓</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.data.disclaimer && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 flex items-start gap-2">
                    <FiAlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {result.data.disclaimer}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Risk Results */}
          {result.type === 'risk' && result.data && (
            <>
              {result.data.overallRisk && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-1">Overall Risk Level</h3>
                  <p className={`text-2xl font-bold ${riskColors[result.data.overallRisk] || 'text-gray-900'}`}>{result.data.overallRisk}</p>
                </div>
              )}

              {result.data.riskFactors && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Factors</h3>
                  <div className="space-y-3">
                    {result.data.riskFactors.map((r, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{r.factor}</h4>
                          <span className={`text-sm font-semibold ${riskColors[r.level] || ''}`}>{r.level}</span>
                        </div>
                        <p className="text-sm text-gray-600">{r.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.data.preventiveActions && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Preventive Actions</h3>
                  <ul className="space-y-2">
                    {result.data.preventiveActions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">→</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Health Tips Results */}
          {result.type === 'tips' && result.data && (
            <>
              {result.data.tips && (
                <div className="space-y-3">
                  {result.data.tips.map((t, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${priorityColors[t.priority] || 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{t.category}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          t.priority === 'high' ? 'bg-red-100 text-red-700' :
                          t.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>{t.priority}</span>
                      </div>
                      <p className="text-sm text-gray-800">{t.tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.data.dailyGoals && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">🎯 Daily Goals</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(result.data.dailyGoals).map(([key, val]) => (
                      <div key={key} className="p-3 bg-blue-50 rounded-xl text-center">
                        <p className="text-xs text-blue-600 font-medium capitalize">{key}</p>
                        <p className="text-lg font-bold text-gray-900">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIHealth;
