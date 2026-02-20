import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiUser, FiStar, FiChevronLeft, FiChevronRight, FiCheck, FiMapPin, FiCreditCard, FiSmartphone, FiShield, FiLock } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const steps = ['Select Doctor', 'Choose Date & Time', 'Review', 'Payment'];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/doctors');
      setDoctors(data.doctors);
    } catch (err) {
      toast.error('Failed to load doctors');
    }
  };

  const fetchSlots = async () => {
    try {
      const { data } = await api.get(`/appointments/slots?doctorId=${selectedDoctor.userId._id}&date=${selectedDate}`);
      setSlots(data.slots);
    } catch (err) {
      setSlots([]);
    }
  };

  const consultationFee = selectedDoctor?.consultationFee || 500;
  const platformFee = Math.round(consultationFee * 0.02);
  const totalAmount = consultationFee + platformFee;

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

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const handlePayAndBook = async () => {
    if (!validatePayment()) return;

    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      await api.post('/appointments', {
        doctor: selectedDoctor.userId._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: appointmentType,
        symptoms,
        paymentMethod: paymentMethod,
        amountPaid: totalAmount,
      });

      setPaymentSuccess(true);
      toast.success('Payment successful! Appointment booked!');

      // Redirect after showing success animation
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
      setProcessing(false);
    }
  };

  // Calendar generation
  const generateCalendar = () => {
    const start = currentMonth.startOf('month');
    const daysInMonth = currentMonth.daysInMonth();
    const startDay = start.day();
    const days = [];

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  };

  const filteredDoctors = doctors.filter(d =>
    d.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatedPage>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Book <span className="gradient-text">Appointment</span></h1>
        <p className="text-gray-400 mt-1">Find a doctor and schedule your visit</p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mb-8"
      >
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <motion.div
              animate={{
                backgroundColor: i <= step ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                scale: i === step ? 1.1 : 1,
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            >
              {i < step ? <FiCheck size={16} /> : i + 1}
            </motion.div>
            <span className={`text-sm hidden md:block ${i <= step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
            {i < steps.length - 1 && (
              <motion.div
                animate={{ backgroundColor: i < step ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }}
                className="w-12 h-0.5 rounded-full"
              />
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Doctor */}
        {step === 0 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or specialization..."
                className="w-full bg-dark-light border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Doctor Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doc, i) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedDoctor(doc); setStep(1); }}
                  className={`
                    bg-dark-light rounded-2xl border p-5 cursor-pointer transition-all
                    ${selectedDoctor?._id === doc._id ? 'border-primary shadow-lg shadow-primary/10' : 'border-white/10 hover:border-white/20'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold"
                    >
                      {doc.userId?.name?.[0]?.toUpperCase()}
                    </motion.div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Dr. {doc.userId?.name}</h3>
                      <p className="text-xs text-primary">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <p className="flex items-center gap-1"><FiStar className="text-warning" size={12} /> {doc.rating || '4.5'} rating</p>
                    <p className="flex items-center gap-1"><FiClock size={12} /> {doc.experience || 0} years experience</p>
                    <p className="flex items-center gap-1"><FiMapPin size={12} /> ₹{doc.consultationFee || 500} consultation</p>
                  </div>
                </motion.div>
              ))}
              {filteredDoctors.length === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 text-center col-span-full py-10">
                  No doctors found
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 1 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-light rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                  <FiChevronLeft size={20} />
                </motion.button>
                <h3 className="text-white font-semibold">{currentMonth.format('MMMM YYYY')}</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="p-2 rounded-lg hover:bg-white/5 text-gray-400">
                  <FiChevronRight size={20} />
                </motion.button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs text-gray-500 py-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendar().map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const dateStr = currentMonth.date(day).format('YYYY-MM-DD');
                  const isPast = dayjs(dateStr).isBefore(dayjs(), 'day');
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === dayjs().format('YYYY-MM-DD');

                  return (
                    <motion.button
                      key={day}
                      whileHover={!isPast ? { scale: 1.15 } : {}}
                      whileTap={!isPast ? { scale: 0.9 } : {}}
                      onClick={() => !isPast && setSelectedDate(dateStr)}
                      disabled={isPast}
                      className={`
                        p-2 rounded-xl text-sm font-medium transition-all
                        ${isPast ? 'text-gray-600 cursor-not-allowed' : 'cursor-pointer'}
                        ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/25' : ''}
                        ${isToday && !isSelected ? 'border border-primary/50 text-primary' : ''}
                        ${!isSelected && !isPast && !isToday ? 'text-gray-300 hover:bg-white/5' : ''}
                      `}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Time Slots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-light rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-white font-semibold mb-2">Available Slots</h3>
              <p className="text-xs text-gray-500 mb-4">{dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</p>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {slots.length > 0 ? slots.map((slot, i) => (
                  <motion.button
                    key={slot.time}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={slot.available ? { scale: 1.05 } : {}}
                    whileTap={slot.available ? { scale: 0.95 } : {}}
                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                    disabled={!slot.available}
                    className={`
                      py-2.5 rounded-xl text-sm font-medium transition-all
                      ${!slot.available ? 'bg-white/5 text-gray-600 line-through cursor-not-allowed' : ''}
                      ${selectedSlot === slot.time ? 'bg-primary text-white shadow-lg shadow-primary/25' : ''}
                      ${slot.available && selectedSlot !== slot.time ? 'bg-white/5 text-gray-300 hover:bg-white/10 cursor-pointer' : ''}
                    `}
                  >
                    {slot.time}
                  </motion.button>
                )) : (
                  <p className="col-span-3 text-center text-gray-500 py-8">No slots available for this date</p>
                )}
              </div>

              {/* Type selector */}
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Appointment Type</p>
                <div className="flex gap-2">
                  {['in-person', 'online'].map(t => (
                    <motion.button
                      key={t}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAppointmentType(t)}
                      className={`
                        px-4 py-2 rounded-xl text-sm capitalize transition-all
                        ${appointmentType === t ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-gray-400 border border-white/10'}
                      `}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Symptoms (optional)</p>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms..."
                  rows={3}
                  className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setStep(0)}>
                  <FiChevronLeft size={16} /> Back
                </Button>
                <Button onClick={() => selectedSlot && setStep(2)} disabled={!selectedSlot}>
                  Continue <FiChevronRight size={16} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-lg mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-light rounded-2xl border border-white/10 p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mb-6"
              >
                <FiCalendar className="text-white" size={28} />
              </motion.div>

              <h3 className="text-xl font-bold text-white text-center mb-6">Review Appointment</h3>

              <div className="space-y-4">
                {[
                  { label: 'Doctor', value: `Dr. ${selectedDoctor?.userId?.name}`, sub: selectedDoctor?.specialization },
                  { label: 'Date', value: dayjs(selectedDate).format('dddd, MMMM D, YYYY') },
                  { label: 'Time', value: selectedSlot },
                  { label: 'Type', value: appointmentType, capitalize: true },
                  ...(symptoms ? [{ label: 'Symptoms', value: symptoms }] : []),
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex justify-between items-start py-2 border-b border-white/5"
                  >
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <div className="text-right">
                      <span className={`text-sm text-white font-medium ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</span>
                      {item.sub && <p className="text-xs text-primary">{item.sub}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Price Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/5"
              >
                <h4 className="text-sm font-semibold text-white mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Consultation Fee</span>
                    <span className="text-white">₹{consultationFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform Fee</span>
                    <span className="text-white">₹{platformFee}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold gradient-text"
                    >
                      ₹{totalAmount}
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              <div className="flex justify-between mt-8">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <FiChevronLeft size={16} /> Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Proceed to Pay <FiCreditCard size={16} />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step 4: Payment */}
        {step === 3 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-lg mx-auto"
          >
            {/* Payment Success */}
            <AnimatePresence>
              {paymentSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ y: 30 }}
                    animate={{ y: 0 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                      className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30"
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <FiCheck className="text-white" size={48} />
                      </motion.div>
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Payment Successful!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-gray-400"
                    >
                      ₹{totalAmount} paid • Appointment confirmed
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-xs text-gray-500 mt-2"
                    >
                      Redirecting to appointments...
                    </motion.p>
                  </motion.div>
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
                  className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 mx-auto border-4 border-primary/20 border-t-primary rounded-full mb-6"
                    />
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-white font-semibold text-lg"
                    >
                      Processing Payment...
                    </motion.p>
                    <p className="text-gray-500 text-sm mt-2">Please don't close this page</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-light rounded-2xl border border-white/10 p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="p-3 bg-gradient-to-r from-primary to-secondary rounded-2xl"
                >
                  <FiLock className="text-white" size={24} />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-1">Secure Payment</h3>
              <p className="text-xs text-gray-500 text-center mb-6">Your payment information is encrypted</p>

              {/* Amount */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-6 p-4 bg-white/[0.03] rounded-xl border border-white/5"
              >
                <p className="text-xs text-gray-500 mb-1">Amount to Pay</p>
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-3xl font-bold gradient-text"
                >
                  ₹{totalAmount}
                </motion.p>
                <p className="text-xs text-gray-500 mt-1">Dr. {selectedDoctor?.userId?.name} • {dayjs(selectedDate).format('MMM D')} at {selectedSlot}</p>
              </motion.div>

              {/* Payment Method Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'card', label: 'Card', icon: FiCreditCard },
                  { id: 'upi', label: 'UPI', icon: FiSmartphone },
                ].map((method, i) => (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border
                      ${paymentMethod === method.id
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}
                    `}
                  >
                    <method.icon size={16} />
                    {method.label}
                  </motion.button>
                ))}
              </div>

              {/* Card Payment Form */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div
                    key="card-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Card Preview */}
                    <motion.div
                      whileHover={{ rotateY: 5, rotateX: 5 }}
                      className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-5 border border-white/10 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                      <div className="flex items-center justify-between mb-8">
                        <div className="w-10 h-7 bg-yellow-400/80 rounded-md" />
                        <FiCreditCard className="text-gray-500" size={24} />
                      </div>
                      <p className="text-white font-mono text-lg tracking-widest mb-4">
                        {cardDetails.number || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Card Holder</p>
                          <p className="text-sm text-white">{cardDetails.name || 'AAPKA NAAM'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Expires</p>
                          <p className="text-sm text-white">{cardDetails.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </motion.div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Card Number</label>
                      <input
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block">Cardholder Name</label>
                      <input
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                        placeholder="RAHUL SHARMA"
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Expiry</label>
                        <input
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">CVV</label>
                        <input
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          placeholder="•••"
                          maxLength={4}
                          type="password"
                          className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'upi' && (
                  <motion.div
                    key="upi-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/[0.03] rounded-2xl p-6 border border-white/5 text-center"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-3"
                      >
                        📱
                      </motion.div>
                      <p className="text-sm text-gray-300 mb-4">Enter your UPI ID to pay</p>
                      <input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm text-center outline-none focus:border-primary transition-all"
                      />
                      <div className="flex items-center justify-center gap-4 mt-4">
                        {['GPay', 'PhonePe', 'Paytm'].map((app, i) => (
                          <motion.span
                            key={app}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="text-[10px] text-gray-500 px-2 py-1 bg-white/5 rounded-lg"
                          >
                            {app}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-5 mb-5"
              >
                <FiShield size={12} className="text-green-500" />
                <span className="text-[10px] text-gray-500">256-bit SSL Encrypted • Secure Payment</span>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)} disabled={processing}>
                  <FiChevronLeft size={16} /> Back
                </Button>
                <Button onClick={handlePayAndBook} loading={processing} disabled={processing}>
                  <FiLock size={14} /> Pay ₹{totalAmount}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default BookAppointment;
