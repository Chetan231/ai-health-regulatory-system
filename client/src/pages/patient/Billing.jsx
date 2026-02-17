import { useState, useEffect } from 'react';
import { getInvoices, createOrder, verifyPayment } from '../../api/billingApi';
import toast from 'react-hot-toast';
import { FiCreditCard, FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [paying, setPaying] = useState(null);

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await getInvoices(params);
      setInvoices(res.data.data.invoices);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePay = async (invoice) => {
    setPaying(invoice._id);
    try {
      const orderRes = await createOrder(invoice._id);
      const { order, demo } = orderRes.data.data;

      if (demo || !window.Razorpay) {
        // Demo mode — simulate payment
        await verifyPayment({
          billingId: invoice._id,
          razorpayPaymentId: `pay_demo_${Date.now()}`,
          razorpayOrderId: order.id,
        });
        toast.success('Payment successful (demo mode)!');
        load();
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'HealthAI',
        description: `Invoice ${invoice.invoiceNumber}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              billingId: invoice._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            load();
          } catch (err) { toast.error('Payment verification failed'); }
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setPaying(null); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-500 mt-1">View invoices and make payments</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['', 'pending', 'paid'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{f || 'All'}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiCreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No invoices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv._id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{inv.invoiceNumber}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[inv.paymentStatus]}`}>{inv.paymentStatus}</span>
                  </div>
                  <div className="space-y-1">
                    {inv.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600 gap-8">
                        <span>{item.description}</span>
                        <span className="font-medium">₹{item.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 text-sm">
                    {inv.discount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span>-₹{inv.discount}</span></div>}
                    {inv.tax > 0 && <div className="flex justify-between text-gray-500"><span>Tax</span><span>+₹{inv.tax}</span></div>}
                    <div className="flex justify-between font-semibold text-gray-900 mt-1">
                      <span>Total</span><span>₹{inv.finalAmount}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(inv.createdAt)}{inv.paidAt && ` • Paid: ${formatDate(inv.paidAt)}`}</p>
                </div>

                {inv.paymentStatus === 'pending' && (
                  <button onClick={() => handlePay(inv)} disabled={paying === inv._id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0">
                    {paying === inv._id ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Processing...</> : <><FiDollarSign className="w-4 h-4" /> Pay Now</>}
                  </button>
                )}
                {inv.paymentStatus === 'paid' && (
                  <div className="flex items-center gap-1.5 text-green-600 flex-shrink-0">
                    <FiCheck className="w-5 h-5" /> <span className="text-sm font-medium">Paid</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Billing;
