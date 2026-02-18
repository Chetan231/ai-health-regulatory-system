import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiUser, FiStar, FiChevronLeft, FiChevronRight, FiCheck, FiMapPin } from 'react-icons/fi';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const steps = ['Select Doctor', 'Choose Date & Time', 'Confirm Booking'];

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

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctor: selectedDoctor.userId._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: appointmentType,
        symptoms,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
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

        {/* Step 3: Confirm */}
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

              <h3 className="text-xl font-bold text-white text-center mb-6">Confirm Your Appointment</h3>

              <div className="space-y-4">
                {[
                  { label: 'Doctor', value: `Dr. ${selectedDoctor?.userId?.name}`, sub: selectedDoctor?.specialization },
                  { label: 'Date', value: dayjs(selectedDate).format('dddd, MMMM D, YYYY') },
                  { label: 'Time', value: selectedSlot },
                  { label: 'Type', value: appointmentType, capitalize: true },
                  ...(symptoms ? [{ label: 'Symptoms', value: symptoms }] : []),
                  { label: 'Fee', value: `₹${selectedDoctor?.consultationFee || 500}` },
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

              <div className="flex justify-between mt-8">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  <FiChevronLeft size={16} /> Back
                </Button>
                <Button onClick={handleBook} loading={loading}>
                  <FiCheck size={16} /> Confirm Booking
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
