import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiClock, FiCheckCircle, FiAlertTriangle, FiX, FiFileText, FiCreditCard, FiSmartphone, FiShield, FiLock, FiDownload, FiCheck, FiCalendar } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import StatsCard from '../../components/common/StatsCard';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const statusConfig = {
  pending: { color: 'bg-warning/20 text-warning border-warning/30', icon: FiClock, label: 'Pending' },
  paid: { color: 'bg-success/20 text-success border-success/30', icon: FiCheckCircle, label: 'Paid' },
  overdue: { color: 'bg-danger/20 text-danger border-danger/30', icon: FiAlertTriangle, label: 'Overdue' },
};

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const num = cardDetails.number.replace(/\s/g, '');
      if (num.length < 16) { toast.error('Enter valid 16-digit card number'); return false; }
      if (!cardDetails.name.trim()) { toast.error('Enter cardholder name'); return false; }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) { toast.error('Enter valid expiry (MM/YY)'); return false; }
      if (cardDetails.cvv.length < 3) { toast.error('Enter valid CVV'); return false; }
    } else if (paymentMethod === 'upi') {
      if (!upiId.includes('@')) { toast.error('Enter valid UPI ID (e.g. name@upi)'); return false; }
    }
    return true;
  };

  const openPayModal = (invoice) => {
    setPayingInvoice(invoice);
    setShowPayModal(true);
    setPaymentSuccess(false);
    setProcessing(false);
    setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
    setUpiId('');
    setPaymentMethod('card');
  };

  const handlePay = async () => {
    if (!validatePayment()) return;
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      await api.post(`/billing/${payingInvoice._id}/pay`, { paymentMethod });
      setPaymentSuccess(true);
      toast.success('Payment successful!');

      // Refresh invoices after delay
      setTimeout(() => {
        setShowPayModal(false);
        setPayingInvoice(null);
        setSelectedInvoice(null);
        fetchInvoices();
      }, 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const getDueStatus = (invoice) => {
    if (invoice.status === 'paid') return null;
    if (!invoice.dueDate) return null;
    const due = dayjs(invoice.dueDate);
    const now = dayjs();
    const diff = due.diff(now, 'day');
    if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} days`, color: 'text-danger' };
    if (diff === 0) return { text: 'Due today', color: 'text-warning' };
    if (diff <= 3) return { text: `Due in ${diff} days`, color: 'text-warning' };
    return { text: `Due ${due.format('MMM D')}`, color: 'text-gray-400' };
  };

  const downloadReceipt = (invoice) => {
    // Generate a simple text receipt and download
    const receipt = `
═══════════════════════════════════════
         PAYMENT RECEIPT
═══════════════════════════════════════

Invoice:    ${invoice.invoiceNumber}
Date:       ${dayjs(invoice.createdAt).format('MMMM D, YYYY')}
Doctor:     Dr. ${invoice.doctor?.name || 'Unknown'}

─────────────────────────────────────
Items:
${(invoice.items || []).map(item => `  ${item.description.padEnd(30)} ₹${item.amount}`).join('\n')}
─────────────────────────────────────
Total:                          ₹${invoice.total}

Status:     ${invoice.status.toUpperCase()}
${invoice.paidAt ? `Paid On:    ${dayjs(invoice.paidAt).format('MMMM D, YYYY h:mm A')}` : ''}
${invoice.paymentMethod ? `Method:     ${invoice.paymentMethod.toUpperCase()}` : ''}

═══════════════════════════════════════
        Thank you for your payment!
═══════════════════════════════════════
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}-receipt.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  if (loading) return <Loader text="Loading billing..." />;

  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">My <span className="gradient-text">Billing</span></h1>
        <p className="text-gray-400 mt-1">Invoices and payment history</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={FiDollarSign} label="Total Amount" value={summary.totalAmount || 0} prefix="₹" color="primary" delay={0} />
        <StatsCard icon={FiCheckCircle} label="Paid" value={summary.paid || 0} prefix="₹" color="success" delay={0.1} />
        <StatsCard icon={FiClock} label="Pending" value={summary.pending || 0} prefix="₹" color="warning" delay={0.2} />
        <StatsCard icon={FiAlertTriangle} label="Overdue" value={summary.overdue || 0} prefix="₹" color="danger" delay={0.3} />
      </div>

      {/* Alert Banners */}
      <AnimatePresence>
        {overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3"
          >
            <FiAlertTriangle className="text-danger flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm text-white font-medium">You have {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-400">Please clear your dues to avoid service interruption</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('overdue')}
              className="text-xs text-danger hover:text-danger/80 font-medium px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 transition-all"
            >
              View
            </motion.button>
          </motion.div>
        )}
        {pendingCount > 0 && overdueCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-warning/10 border border-warning/20 rounded-2xl flex items-center gap-3"
          >
            <FiClock className="text-warning flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{pendingCount} pending payment{pendingCount > 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-400">Pay before the due date to avoid late fees</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('pending')}
              className="text-xs text-warning hover:text-warning/80 font-medium px-3 py-1.5 rounded-lg bg-warning/10 hover:bg-warning/20 transition-all"
            >
              View
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: `Pending${pendingCount ? ` (${pendingCount})` : ''}` },
          { key: 'paid', label: 'Paid' },
          { key: 'overdue', label: `Overdue${overdueCount ? ` (${overdueCount})` : ''}` },
        ].map((f, i) => (
          <motion.button
            key={f.key}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${filter === f.key ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-light text-gray-400 border border-white/10'}`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Invoices */}
      <div className="space-y-3">
        {invoices.map((inv, i) => {
          const config = statusConfig[inv.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const dueStatus = getDueStatus(inv);

          return (
            <motion.div
              key={inv._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className="bg-dark-light rounded-2xl border border-white/10 p-5 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setSelectedInvoice(inv)}>
                  <motion.div whileHover={{ rotate: 10 }} className="p-2.5 rounded-xl bg-warning/10 text-warning">
                    <FiFileText size={20} />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{inv.invoiceNumber}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Dr. {inv.doctor?.name || 'Unknown'} • {dayjs(inv.createdAt).format('MMM D, YYYY')}
                    </p>
                    {dueStatus && (
                      <p className={`text-[10px] mt-0.5 ${dueStatus.color}`}>{dueStatus.text}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">₹{inv.total}</span>
                  <motion.span whileHover={{ scale: 1.05 }} className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border capitalize ${config.color}`}>
                    <StatusIcon size={12} /> {inv.status}
                  </motion.span>
                  {/* Action Buttons */}
                  {(inv.status === 'pending' || inv.status === 'overdue') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); openPayModal(inv); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/80 transition-all"
                    >
                      <FiCreditCard size={12} /> Pay Now
                    </motion.button>
                  )}
                  {inv.status === 'paid' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); downloadReceipt(inv); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-all"
                    >
                      <FiDownload size={12} /> Receipt
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {invoices.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">
            {filter === 'paid' ? '✅' : filter === 'overdue' ? '🎉' : '💰'}
          </motion.div>
          <p className="text-gray-400">
            {filter === 'paid' ? 'No paid invoices yet' : filter === 'overdue' ? 'No overdue invoices — great!' : filter === 'pending' ? 'No pending payments' : 'No invoices found'}
          </p>
        </motion.div>
      )}

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && !showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} onClick={(e) => e.stopPropagation()} className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{selectedInvoice.invoiceNumber}</h2>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={() => setSelectedInvoice(null)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><FiX size={20} /></motion.button>
              </div>

              {/* Status Badge */}
              {(() => {
                const config = statusConfig[selectedInvoice.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border mb-5 ${config.color}`}>
                    <StatusIcon size={14} /> {config.label}
                  </motion.div>
                );
              })()}

              {/* Items */}
              <div className="space-y-3 mb-6">
                {selectedInvoice.items?.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
                    <span className="text-sm text-gray-300">{item.description}</span>
                    <span className="text-sm text-white font-medium">₹{item.amount}</span>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-4 flex items-center justify-between mb-5">
                <span className="text-gray-400 font-medium">Total</span>
                <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-2xl font-bold gradient-text">₹{selectedInvoice.total}</motion.span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mb-6">
                <div className="p-3 bg-white/[0.02] rounded-xl">
                  <span className="text-gray-500 block mb-0.5">Doctor</span>
                  <span className="text-white">Dr. {selectedInvoice.doctor?.name}</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl">
                  <span className="text-gray-500 block mb-0.5">Date</span>
                  <span className="text-white">{dayjs(selectedInvoice.createdAt).format('MMM D, YYYY')}</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl">
                  <span className="text-gray-500 block mb-0.5">Due Date</span>
                  <span className="text-white">{selectedInvoice.dueDate ? dayjs(selectedInvoice.dueDate).format('MMM D, YYYY') : 'N/A'}</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl">
                  <span className="text-gray-500 block mb-0.5">{selectedInvoice.status === 'paid' ? 'Paid On' : 'Status'}</span>
                  <span className="text-white capitalize">{selectedInvoice.status === 'paid' && selectedInvoice.paidAt ? dayjs(selectedInvoice.paidAt).format('MMM D, YYYY') : selectedInvoice.status}</span>
                </div>
                {selectedInvoice.paymentMethod && (
                  <div className="p-3 bg-white/[0.02] rounded-xl col-span-2">
                    <span className="text-gray-500 block mb-0.5">Payment Method</span>
                    <span className="text-white capitalize">{selectedInvoice.paymentMethod}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {(selectedInvoice.status === 'pending' || selectedInvoice.status === 'overdue') && (
                  <Button onClick={() => { setSelectedInvoice(null); openPayModal(selectedInvoice); }} className="flex-1">
                    <FiCreditCard size={16} /> Pay ₹{selectedInvoice.total}
                  </Button>
                )}
                {selectedInvoice.status === 'paid' && (
                  <Button variant="secondary" onClick={() => downloadReceipt(selectedInvoice)} className="flex-1">
                    <FiDownload size={16} /> Download Receipt
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayModal && payingInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => !processing && setShowPayModal(false)}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} onClick={(e) => e.stopPropagation()} className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-md w-full relative">

              {/* Payment Success Overlay */}
              <AnimatePresence>
                {paymentSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-dark-light rounded-2xl z-10 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-green-500/30"
                      >
                        <FiCheck className="text-white" size={40} />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-white mb-1"
                      >
                        Payment Successful!
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-400 text-sm"
                      >
                        ₹{payingInvoice.total} paid for {payingInvoice.invoiceNumber}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing Overlay */}
              <AnimatePresence>
                {processing && !paymentSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-dark-light/95 rounded-2xl z-10 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-14 h-14 mx-auto border-4 border-primary/20 border-t-primary rounded-full mb-4"
                      />
                      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white font-semibold">
                        Processing Payment...
                      </motion.p>
                      <p className="text-gray-500 text-xs mt-1">Please wait</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <FiLock className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Pay Invoice</h3>
                    <p className="text-xs text-gray-500">{payingInvoice.invoiceNumber}</p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={() => !processing && setShowPayModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                  <FiX size={20} />
                </motion.button>
              </div>

              {/* Amount */}
              <div className="text-center mb-5 p-4 bg-white/[0.03] rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold gradient-text">₹{payingInvoice.total}</p>
                <p className="text-xs text-gray-500 mt-1">Dr. {payingInvoice.doctor?.name || 'Unknown'}</p>
              </div>

              {/* Payment Method */}
              <div className="flex gap-2 mb-5">
                {[
                  { id: 'card', label: 'Card', icon: FiCreditCard },
                  { id: 'upi', label: 'UPI', icon: FiSmartphone },
                ].map((m) => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border ${
                      paymentMethod === m.id
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    <m.icon size={16} /> {m.label}
                  </motion.button>
                ))}
              </div>

              {/* Card Form */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Card Number</label>
                      <input value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Cardholder Name</label>
                      <input value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })} placeholder="RAHUL SHARMA" className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Expiry</label>
                        <input value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })} placeholder="MM/YY" maxLength={5} className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">CVV</label>
                        <input value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="•••" maxLength={4} type="password" className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all" />
                      </div>
                    </div>
                  </motion.div>
                )}
                {paymentMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                    <div className="text-center p-4 bg-white/[0.02] rounded-xl">
                      <p className="text-3xl mb-2">📱</p>
                      <p className="text-sm text-gray-300 mb-3">Enter your UPI ID</p>
                      <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-center outline-none focus:border-primary transition-all" />
                      <div className="flex items-center justify-center gap-3 mt-3">
                        {['GPay', 'PhonePe', 'Paytm'].map(app => (
                          <span key={app} className="text-[10px] text-gray-500 px-2 py-1 bg-white/5 rounded-lg">{app}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security & Pay */}
              <div className="flex items-center justify-center gap-2 mt-4 mb-4">
                <FiShield size={12} className="text-green-500" />
                <span className="text-[10px] text-gray-500">256-bit SSL Encrypted • Secure Payment</span>
              </div>

              <Button onClick={handlePay} loading={processing} disabled={processing} className="w-full">
                <FiLock size={14} /> Pay ₹{payingInvoice.total}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default Billing;
