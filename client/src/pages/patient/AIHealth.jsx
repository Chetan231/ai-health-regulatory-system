import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiSend, FiAlertTriangle, FiCheckCircle, FiShield, FiActivity, FiHeart } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

const urgencyColors = {
  'non-urgent': 'text-success bg-success/10 border-success/20',
  'moderate': 'text-warning bg-warning/10 border-warning/20',
  'urgent': 'text-danger bg-danger/10 border-danger/20',
};

const riskColors = {
  Low: 'text-success',
  Moderate: 'text-warning',
  High: 'text-danger',
};

const AIHealth = () => {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const handleSymptomCheck = async () => {
    if (!symptoms.trim()) return toast.error('Please describe your symptoms');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/ai/symptom-check', { symptoms });
      setResult(data);
    } catch (err) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskCheck = async () => {
    setRiskLoading(true);
    setRiskData(null);
    try {
      const { data } = await api.get('/ai/health-risk');
      setRiskData(data);
    } catch (err) {
      toast.error('Risk analysis failed');
    } finally {
      setRiskLoading(false);
    }
  };

  const tabs = [
    { id: 'symptoms', label: 'Symptom Checker', icon: FiActivity },
    { id: 'risk', label: 'Health Risk', icon: FiShield },
  ];

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">AI <span className="gradient-text">Health Assistant</span> 🤖</h1>
        <p className="text-gray-400 mt-1">Get AI-powered health insights (not a replacement for medical advice)</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-dark-light text-gray-400 border border-white/10'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Symptom Checker */}
        {activeTab === 'symptoms' && (
          <motion.div key="symptoms" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="p-3 rounded-xl bg-primary/10 text-primary">
                  <FiCpu size={24} />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold">Describe Your Symptoms</h3>
                  <p className="text-xs text-gray-500">Be as detailed as possible for better analysis</p>
                </div>
              </div>

              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., I've been having headaches for the past 3 days, along with mild fever, body aches, and a sore throat..."
                rows={4}
                className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all resize-none mb-4"
              />

              <Button onClick={handleSymptomCheck} loading={loading} className="w-full">
                <FiSend size={16} /> Analyze Symptoms
              </Button>
            </motion.div>

            {/* Loading animation */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-10">
                  <motion.div className="flex gap-2 mb-4">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [0, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} className="w-3 h-3 bg-primary rounded-full" />
                    ))}
                  </motion.div>
                  <p className="text-gray-400 text-sm">Analyzing your symptoms...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Analysis */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
                    <p className="text-sm text-gray-300 mb-3">{result.analysis}</p>
                    <motion.span whileHover={{ scale: 1.05 }} className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${urgencyColors[result.urgency] || urgencyColors['non-urgent']}`}>
                      Urgency: {result.urgency}
                    </motion.span>
                  </motion.div>

                  {/* Possible Conditions */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-4">Possible Conditions</h3>
                    <div className="space-y-3">
                      {result.possibleConditions?.map((cond, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          whileHover={{ x: 4 }}
                          className="p-4 bg-white/[0.03] rounded-xl border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium">{cond.condition}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cond.probability === 'High' ? 'bg-danger/10 text-danger' : cond.probability === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                                {cond.probability} probability
                              </span>
                              <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-gray-400">{cond.severity}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">{cond.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-3">Recommendations</h3>
                    <div className="space-y-2">
                      {result.recommendations?.map((rec, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="flex items-start gap-2 text-sm text-gray-300">
                          <FiCheckCircle className="text-success mt-0.5 flex-shrink-0" size={14} />
                          {rec}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Disclaimer */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-start gap-2 p-4 bg-warning/5 rounded-xl border border-warning/10">
                    <FiAlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-gray-400">{result.disclaimer}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Health Risk */}
        {activeTab === 'risk' && (
          <motion.div key="risk" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            {!riskData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-8 text-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="w-20 h-20 mx-auto bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4">
                  <FiShield size={36} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Health Risk Assessment</h3>
                <p className="text-sm text-gray-400 mb-6">AI-powered analysis based on your vitals, medical history, and reports</p>
                <Button onClick={handleRiskCheck} loading={riskLoading}>
                  <FiActivity size={16} /> Run Assessment
                </Button>
              </motion.div>
            )}

            <AnimatePresence>
              {riskData && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Overall Score */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-dark-light rounded-2xl border border-white/10 p-6 text-center">
                    <h3 className="text-white font-semibold mb-4">Overall Risk Score</h3>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="relative w-36 h-36 mx-auto mb-4"
                    >
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <motion.circle
                          cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
                          stroke={riskData.riskScore < 30 ? '#10b981' : riskData.riskScore < 60 ? '#f59e0b' : '#ef4444'}
                          strokeDasharray={326.7}
                          initial={{ strokeDashoffset: 326.7 }}
                          animate={{ strokeDashoffset: 326.7 * (1 - riskData.riskScore / 100) }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${riskColors[riskData.overallRisk]}`}>{riskData.riskScore}</span>
                        <span className="text-xs text-gray-400">{riskData.overallRisk} Risk</span>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Risk Factors */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-4">Risk Factors</h3>
                    <div className="space-y-3">
                      {riskData.factors?.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.08 }}
                          className="p-3 bg-white/[0.02] rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white font-medium">{f.factor}</span>
                            <span className={`text-xs font-medium ${riskColors[f.risk]}`}>{f.risk} ({f.score}/100)</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${f.score}%` }}
                              transition={{ duration: 1.5, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: f.score < 30 ? '#10b981' : f.score < 60 ? '#f59e0b' : '#ef4444' }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{f.details}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recommendations */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-dark-light rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-semibold mb-3">Recommendations</h3>
                    {riskData.recommendations?.map((rec, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }} className="flex items-start gap-2 text-sm text-gray-300 mb-2">
                        <FiCheckCircle className="text-success mt-0.5 flex-shrink-0" size={14} /> {rec}
                      </motion.div>
                    ))}
                  </motion.div>

                  <Button variant="secondary" onClick={() => setRiskData(null)} className="w-full">Run Again</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default AIHealth;
