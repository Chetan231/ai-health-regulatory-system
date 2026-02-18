import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiFilter, FiEye, FiDownload, FiSearch, FiActivity, FiHeart, FiZap, FiDroplet, FiX } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const reportTypeConfig = {
  'blood-test': { icon: FiDroplet, color: 'text-danger', bg: 'bg-danger/10' },
  'cbc': { icon: FiDroplet, color: 'text-danger', bg: 'bg-danger/10' },
  'lipid-panel': { icon: FiHeart, color: 'text-warning', bg: 'bg-warning/10' },
  'ecg': { icon: FiActivity, color: 'text-primary', bg: 'bg-primary/10' },
  'imaging': { icon: FiEye, color: 'text-accent', bg: 'bg-accent/10' },
  'x-ray': { icon: FiZap, color: 'text-secondary', bg: 'bg-secondary/10' },
  'mri': { icon: FiZap, color: 'text-secondary', bg: 'bg-secondary/10' },
  'ct-scan': { icon: FiZap, color: 'text-secondary', bg: 'bg-secondary/10' },
  'thyroid': { icon: FiActivity, color: 'text-success', bg: 'bg-success/10' },
  'liver': { icon: FiActivity, color: 'text-warning', bg: 'bg-warning/10' },
  'kidney': { icon: FiActivity, color: 'text-accent', bg: 'bg-accent/10' },
  'urine-test': { icon: FiDroplet, color: 'text-warning', bg: 'bg-warning/10' },
  'other': { icon: FiFileText, color: 'text-gray-400', bg: 'bg-white/5' },
};

const reportTypes = ['all', 'blood-test', 'cbc', 'lipid-panel', 'ecg', 'imaging', 'x-ray', 'mri', 'thyroid', 'liver', 'kidney', 'urine-test'];

const statusColors = {
  normal: 'text-success bg-success/10',
  low: 'text-warning bg-warning/10',
  high: 'text-danger bg-danger/10',
  critical: 'text-danger bg-danger/20 animate-pulse',
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => { fetchReports(); }, [filter]);

  const fetchReports = async () => {
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const { data } = await api.get(`/reports${params}`);
      setReports(data.reports);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading reports..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Medical <span className="gradient-text">Reports</span></h1>
        <p className="text-gray-400 mt-1">{reports.length} reports available</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="w-full max-w-md bg-dark-light border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-primary transition-all" />
      </motion.div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {reportTypes.map((t, i) => (
          <motion.button
            key={t}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition-all ${filter === t ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10'}`}
          >
            {t.replace('-', ' ')}
          </motion.button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report, i) => {
          const config = reportTypeConfig[report.type] || reportTypeConfig.other;
          const Icon = config.icon;

          return (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedReport(report)}
              className="bg-dark-light rounded-2xl border border-white/10 p-5 cursor-pointer hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className={`p-2.5 rounded-xl ${config.bg} ${config.color}`}>
                  <Icon size={20} />
                </motion.div>
                <span className="text-[10px] text-gray-500">{dayjs(report.date).format('MMM D, YYYY')}</span>
              </div>

              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{report.title}</h3>
              <p className="text-xs text-gray-500 mb-3">Dr. {report.doctor?.name || 'Unknown'}</p>

              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${config.bg} ${config.color} border border-current/20`}>
                  {report.type.replace('-', ' ')}
                </span>
                {report.results?.length > 0 && (
                  <span className="text-[10px] text-gray-500">{report.results.length} parameters</span>
                )}
              </div>

              {/* Mini result preview */}
              {report.results?.slice(0, 2).map((r, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + j * 0.1 }}
                  className="mt-2 flex items-center justify-between text-[11px] py-1 border-t border-white/5"
                >
                  <span className="text-gray-500">{r.parameter}</span>
                  <span className={`px-1.5 py-0.5 rounded ${statusColors[r.status] || ''}`}>
                    {r.value} {r.unit}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">🧪</motion.div>
          <p className="text-gray-400">No reports found</p>
        </motion.div>
      )}

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">Dr. {selectedReport.doctor?.name} • {dayjs(selectedReport.date).format('MMMM D, YYYY')}</p>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedReport(null)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                  <FiX size={20} />
                </motion.button>
              </div>

              {selectedReport.description && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 mb-4 p-3 bg-white/[0.02] rounded-xl">{selectedReport.description}</motion.p>
              )}

              {/* Results Table */}
              {selectedReport.results?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Test Results</h3>
                  <div className="space-y-2">
                    {selectedReport.results.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-all"
                      >
                        <div>
                          <p className="text-sm text-white font-medium">{r.parameter}</p>
                          <p className="text-[10px] text-gray-500">Normal: {r.normalRange}</p>
                        </div>
                        <div className="text-right">
                          <motion.span
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[r.status] || ''}`}
                          >
                            {r.value} {r.unit}
                          </motion.span>
                          <p className={`text-[10px] mt-0.5 capitalize ${r.status === 'normal' ? 'text-success' : r.status === 'critical' ? 'text-danger' : 'text-warning'}`}>
                            {r.status}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {selectedReport.aiSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 mb-4"
                >
                  <h3 className="text-sm font-semibold text-primary mb-2">🤖 AI Analysis</h3>
                  <p className="text-sm text-gray-300">{selectedReport.aiSummary}</p>
                </motion.div>
              )}

              {/* Files */}
              {selectedReport.files?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Attached Files</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.files.map((f, i) => (
                      <motion.a
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        href={f.url}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-xs text-gray-300 hover:text-primary border border-white/10 hover:border-primary/30 transition-all"
                      >
                        <FiDownload size={12} /> {f.filename}
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Reports;
