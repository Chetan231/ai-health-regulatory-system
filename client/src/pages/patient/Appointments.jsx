import { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus, getAvailableSlots, bookAppointment } from '../../api/appointmentApi';
import { listDoctors } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiX, FiPlus, FiSearch } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [showBooking, setShowBooking] = useState(false);

  // Booking state
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingType, setBookingType] = useState('in-person');
  const [symptoms, setSymptoms] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');

  useEffect(() => { loadAppointments(); }, [tab]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = tab === 'upcoming' ? { upcoming: 'true' } : tab === 'past' ? { status: 'completed' } : { status: 'cancelled' };
      const res = await getAppointments(params);
      setAppointments(res.data.data.appointments);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await updateAppointmentStatus(id, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // Booking flow
  const openBooking = async () => {
    setShowBooking(true);
    try {
      const res = await listDoctors({ available: 'true', limit: 50 });
      setDoctors(res.data.data.doctors);
    } catch (err) { toast.error('Failed to load doctors'); }
  };

  const selectDoctor = (doc) => {
    setSelectedDoctor(doc);
    setDate('');
    setSlots([]);
    setSelectedSlot('');
  };

  const loadSlots = async (d) => {
    setDate(d);
    setSelectedSlot('');
    setSlotsLoading(true);
    try {
      const res = await getAvailableSlots(selectedDoctor.userId._id, d);
      setSlots(res.data.data.slots);
    } catch (err) { toast.error('Failed to load slots'); }
    finally { setSlotsLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Select a time slot');
    setBooking(true);
    try {
      await bookAppointment({
        doctorId: selectedDoctor.userId._id,
        date,
        timeSlot: selectedSlot,
        type: bookingType,
        symptoms,
      });
      toast.success('Appointment booked!');
      setShowBooking(false);
      resetBooking();
      loadAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to book'); }
    finally { setBooking(false); }
  };

  const resetBooking = () => {
    setSelectedDoctor(null); setDate(''); setSlots([]); setSelectedSlot(''); setSymptoms(''); setDoctorSearch('');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const filteredDoctors = doctors.filter((d) =>
    d.userId?.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your doctor appointments</p>
        </div>
        <button onClick={openBooking} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
          <FiPlus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['upcoming', 'past', 'cancelled'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No {tab} appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold flex-shrink-0">
                    {a.doctorId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {a.doctorId?.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" /> {formatDate(a.date)}</span>
                      <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {a.timeSlot}</span>
                      <span className="flex items-center gap-1">
                        {a.type === 'video' ? <FiVideo className="w-3.5 h-3.5" /> : <FiMapPin className="w-3.5 h-3.5" />}
                        {a.type === 'video' ? 'Video Call' : 'In-Person'}
                      </span>
                    </div>
                    {a.symptoms && <p className="text-sm text-gray-500 mt-1">Symptoms: {a.symptoms}</p>}
                    {a.diagnosis && <p className="text-sm text-emerald-600 mt-1">Diagnosis: {a.diagnosis}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[a.status]}`}>{a.status}</span>
                  {(a.status === 'pending' || a.status === 'confirmed') && (
                    <button onClick={() => handleCancel(a._id)} className="p-1.5 text-gray-300 hover:text-red-500 transition">
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
              <button onClick={() => { setShowBooking(false); resetBooking(); }} className="text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
            </div>

            {/* Step 1: Select Doctor */}
            {!selectedDoctor ? (
              <div className="space-y-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} placeholder="Search doctor or specialization..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredDoctors.map((d) => (
                    <button key={d._id} onClick={() => selectDoctor(d)}
                      className="w-full flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-blue-50 transition text-left">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {d.userId?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Dr. {d.userId?.name}</p>
                        <p className="text-xs text-gray-500">{d.specialization} • ₹{d.consultationFee}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Doctor */}
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-semibold">
                    {selectedDoctor.userId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Dr. {selectedDoctor.userId?.name}</p>
                    <p className="text-xs text-gray-500">{selectedDoctor.specialization} • ₹{selectedDoctor.consultationFee}</p>
                  </div>
                  <button onClick={resetBooking} className="text-xs text-blue-600 hover:underline">Change</button>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input type="date" value={date} onChange={(e) => loadSlots(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                {/* Time Slots */}
                {date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                    {slotsLoading ? (
                      <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">No slots available on this date</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s) => (
                          <button key={s} onClick={() => setSelectedSlot(s)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              selectedSlot === s ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-blue-50'
                            }`}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                  <div className="flex gap-3">
                    {[{ value: 'in-person', label: 'In-Person', icon: FiMapPin }, { value: 'video', label: 'Video Call', icon: FiVideo }].map((t) => (
                      <button key={t.value} onClick={() => setBookingType(t.value)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                          bookingType === t.value ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-blue-50'
                        }`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (optional)</label>
                  <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={2} placeholder="Describe your symptoms..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                </div>

                <button onClick={handleBook} disabled={!selectedSlot || booking}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {booking ? 'Booking...' : `Book Appointment — ₹${selectedDoctor.consultationFee}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
