import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiHeart, FiDroplet, FiThermometer, FiPlus, FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnimatedPage from '../../components/common/AnimatedPage';
import AnimatedCard from '../../components/common/AnimatedCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const vitalTypes = [
  { value: 'blood-pressure', label: 'Blood Pressure', icon: FiHeart, color: '#ef4444', unit: 'mmHg', gradient: ['#ef4444', '#f87171'] },
  { value: 'heart-rate', label: 'Heart Rate', icon: FiActivity, color: '#0ea5e9', unit: 'bpm', gradient: ['#0ea5e9', '#38bdf8'] },
  { value: 'glucose', label: 'Blood Glucose', icon: FiDroplet, color: '#f59e0b', unit: 'mg/dL', gradient: ['#f59e0b', '#fbbf24'] },
  { value: 'temperature', label: 'Temperature', icon: FiThermometer, color: '#8b5cf6', unit: '°F', gradient: ['#8b5cf6', '#a78bfa'] },
  { value: 'oxygen-saturation', label: 'SpO2', icon: FiActivity, color: '#10b981', unit: '%', gradient: ['#10b981', '#34d399'] },
  { value: 'weight', label: 'Weight', icon: FiActivity, color: '#06b6d4', unit: 'kg', gradient: ['#06b6d4', '#22d3ee'] },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-light border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-white font-semibold">{payload[0].value} {payload[0].payload.unit}</p>
    </div>
  );
};

const Vitals = () => {
  const [trends, setTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('heart-rate');
  const [showAdd, setShowAdd] = useState(false);
  const [newVital, setNewVital] = useState({ type: 'heart-rate', value: '', unit: 'bpm', notes: '' });
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => { fetchTrends(); }, [days]);

  const fetchTrends = async () => {
    try {
      const { data } = await api.get(`/vitals/trends?days=${days}`);
      setTrends(data);
    } catch (err) {
      toast.error('Failed to load vitals');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newVital.value) return toast.error('Enter a value');
    setSaving(true);
    try {
      await api.post('/vitals', newVital);
      toast.success('Vital recorded!');
      setShowAdd(false);
      setNewVital({ type: 'heart-rate', value: '', unit: 'bpm', notes: '' });
      fetchTrends();
    } catch (err) {
      toast.error('Failed to record vital');
    } finally {
      setSaving(false);
    }
  };

  const getChartData = (type) => {
    const data = trends[type] || [];
    return data.map(d => ({
      date: dayjs(d.date).format('MMM D'),
      value: parseFloat(d.value) || 0,
      unit: d.unit,
    }));
  };

  const getLatestValue = (type) => {
    const data = trends[type];
    if (!data?.length) return null;
    return data[data.length - 1];
  };

  const activeConfig = vitalTypes.find(v => v.value === activeType);

  if (loading) return <Loader text="Loading vitals..." />;

  return (
    <AnimatedPage>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">Vitals <span className="gradient-text">Monitoring</span></h1>
          <p className="text-gray-400 mt-1">Track your health metrics over time</p>
        </motion.div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <motion.button
              key={d}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${days === d ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10'}`}
            >
              {d}D
            </motion.button>
          ))}
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <FiPlus size={14} /> Record
          </Button>
        </div>
      </div>

      {/* Vital Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {vitalTypes.map((vt, i) => {
          const latest = getLatestValue(vt.value);
          const Icon = vt.icon;

          return (
            <motion.div
              key={vt.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveType(vt.value)}
              className={`
                p-4 rounded-2xl border cursor-pointer transition-all
                ${activeType === vt.value
                  ? 'border-white/20 bg-white/5 shadow-lg'
                  : 'border-white/5 bg-dark-light hover:border-white/10'}
              `}
            >
              <Icon size={18} style={{ color: vt.color }} className="mb-2" />
              <p className="text-[10px] text-gray-500 mb-1">{vt.label}</p>
              {latest ? (
                <motion.p
                  key={latest.value}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-bold text-white"
                >
                  {latest.value}
                  <span className="text-[10px] text-gray-500 ml-1">{latest.unit}</span>
                </motion.p>
              ) : (
                <p className="text-sm text-gray-600">No data</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-light rounded-2xl border border-white/10 p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${activeConfig?.color}20` }}
            >
              {activeConfig && <activeConfig.icon size={20} style={{ color: activeConfig.color }} />}
            </motion.div>
            <div>
              <h3 className="text-white font-semibold">{activeConfig?.label} Trend</h3>
              <p className="text-xs text-gray-500">Last {days} days</p>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          {getChartData(activeType).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData(activeType)}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeConfig?.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={activeConfig?.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={activeConfig?.color}
                  strokeWidth={2.5}
                  fill="url(#colorGradient)"
                  dot={{ fill: activeConfig?.color, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-3">📊</motion.div>
              <p className="text-gray-500 text-sm">No data for {activeConfig?.label}</p>
              <button onClick={() => setShowAdd(true)} className="text-primary text-xs mt-2 hover:underline">Record your first reading</button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Readings */}
      {trends[activeType]?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-light rounded-2xl border border-white/10 p-6"
        >
          <h3 className="text-white font-semibold mb-4">Recent Readings</h3>
          <div className="space-y-2">
            {trends[activeType].slice(-10).reverse().map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeConfig?.color }} />
                  <span className="text-sm text-gray-400">{dayjs(v.date).format('MMM D, h:mm A')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{v.value} {v.unit}</span>
                  {v.notes && <span className="text-[10px] text-gray-500 max-w-[150px] truncate">({v.notes})</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Vital Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Record Vital</h3>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                  <FiX size={20} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Type</label>
                  <select
                    value={newVital.type}
                    onChange={(e) => {
                      const vt = vitalTypes.find(v => v.value === e.target.value);
                      setNewVital({ ...newVital, type: e.target.value, unit: vt?.unit || '' });
                    }}
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                  >
                    {vitalTypes.map(vt => (
                      <option key={vt.value} value={vt.value}>{vt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Value"
                    type="number"
                    placeholder="120"
                    value={newVital.value}
                    onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                  />
                  <Input
                    label="Unit"
                    value={newVital.unit}
                    onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Notes (optional)</label>
                  <input
                    value={newVital.notes}
                    onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                    placeholder="After breakfast, resting..."
                    className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary"
                  />
                </div>

                <Button onClick={handleAdd} loading={saving} className="w-full">
                  <FiPlus size={16} /> Record Vital
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Vitals;
