import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiClock, FiCheckCircle, FiAlertTriangle, FiEye, FiX, FiFileText } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const statusConfig = {
  pending: { color: 'bg-warning/20 text-warning border-warning/30', icon: FiClock },
  paid: { color: 'bg-success/20 text-success border-success/30', icon: FiCheckCircle },
  overdue: { color: 'bg-danger/20 text-danger border-danger/30', icon: FiAlertTriangle },
};

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => { fetchInvoices(); }, [filter]);

  const fetchInvoices = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await api.get(`/billing${params}`);
      setInvoices(data.invoices);
      setSummary(data.summary);
    } catch (err) {
      toast.error('Failed to load billing');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading billing..." />;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Billing</span></h1>
        <p className="text-gray-400 mt-1">Invoices and payment history</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={FiDollarSign} label="Total Amount" value={summary.totalAmount || 0} color="primary" delay={0} />
        <StatsCard icon={FiCheckCircle} label="Paid" value={summary.paid || 0} color="success" delay={0.1} />
        <StatsCard icon={FiClock} label="Pending" value={summary.pending || 0} color="warning" delay={0.2} />
        <StatsCard icon={FiAlertTriangle} label="Overdue" value={summary.overdue || 0} color="danger" delay={0.3} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'paid', 'overdue'].map((f, i) => (
          <motion.button
            key={f}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm capitalize transition-all ${filter === f ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10'}`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* Invoices */}
      <div className="space-y-3">
        {invoices.map((inv, i) => {
          const config = statusConfig[inv.status] || statusConfig.pending;
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={inv._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedInvoice(inv)}
              className="bg-dark-light rounded-2xl border border-white/10 p-5 cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ rotate: 10 }} className="p-2.5 rounded-xl bg-warning/10 text-warning">
                    <FiFileText size={20} />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{inv.invoiceNumber}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dr. {inv.doctor?.name || 'Unknown'} • {dayjs(inv.createdAt).format('MMM D, YYYY')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">₹{inv.total}</span>
                  <motion.span whileHover={{ scale: 1.05 }} className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border capitalize ${config.color}`}>
                    <StatusIcon size={12} /> {inv.status}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {invoices.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">💰</motion.div>
          <p className="text-gray-400">No invoices found</p>
        </motion.div>
      )}

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} onClick={(e) => e.stopPropagation()} className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{selectedInvoice.invoiceNumber}</h2>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={() => setSelectedInvoice(null)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><FiX size={20} /></motion.button>
              </div>

              <div className="space-y-3 mb-6">
                {selectedInvoice.items?.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <span className="text-sm text-gray-300">{item.description}</span>
                    <span className="text-sm text-white font-medium">₹{item.amount}</span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-gray-400 font-medium">Total</span>
                <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-2xl font-bold gradient-text">₹{selectedInvoice.total}</motion.span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div><span className="text-gray-500">Doctor:</span> Dr. {selectedInvoice.doctor?.name}</div>
                <div><span className="text-gray-500">Date:</span> {dayjs(selectedInvoice.createdAt).format('MMM D, YYYY')}</div>
                <div><span className="text-gray-500">Due:</span> {selectedInvoice.dueDate ? dayjs(selectedInvoice.dueDate).format('MMM D, YYYY') : 'N/A'}</div>
                <div><span className="text-gray-500">Status:</span> <span className="capitalize">{selectedInvoice.status}</span></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Billing;
