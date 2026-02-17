import { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus } from '../../api/appointmentApi';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiVideo, FiMapPin, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [completing, setCompleting] = useState(null); // appointment id being completed
  const [completeForm, setCompleteForm] = useState({ diagnosis: '', notes: '', followUpDate: '' });

  useEffect(() => { load(); }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      const params = tab === 'upcoming' ? { upcoming: 'true' } : { status: tab };
      const res = await getAppointments(params);
      setAppointments(res.data.data.appointments);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleComplete = async (id) => {
    try {
      await updateAppointmentStatus(id, { status: 'completed', ...completeForm });
      toast.success('Appointment completed');
      setCompleting(null);
      setCompleteForm({ diagnosis: '', notes: '', followUpDate: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 mt-1">Manage patient appointments</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['pending', 'confirmed', 'upcoming', 'completed', 'cancelled'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition capitalize ${
              tab === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No {tab} appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    {a.patientId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.patientId?.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" /> {formatDate(a.date)}</span>
                      <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {a.timeSlot}</span>
                      <span className="flex items-center gap-1">
                        {a.type === 'video' ? <FiVideo className="w-3.5 h-3.5" /> : <FiMapPin className="w-3.5 h-3.5" />}
                        {a.type === 'video' ? 'Video' : 'In-Person'}
                      </span>
                    </div>
                    {a.symptoms && <p className="text-sm text-gray-500 mt-1">Symptoms: {a.symptoms}</p>}
                    {a.diagnosis && <p className="text-sm text-emerald-600 mt-1">Diagnosis: {a.diagnosis}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[a.status]}`}>{a.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {a.status === 'pending' && (
                <div className="flex gap-2 mt-4 ml-16">
                  <button onClick={() => handleStatus(a._id, 'confirmed')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                    <FiCheck className="w-4 h-4" /> Confirm
                  </button>
                  <button onClick={() => handleStatus(a._id, 'cancelled')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                    <FiX className="w-4 h-4" /> Decline
                  </button>
                </div>
              )}

              {a.status === 'confirmed' && (
                <div className="mt-4 ml-16">
                  {completing === a._id ? (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                      <input type="text" value={completeForm.diagnosis} onChange={(e) => setCompleteForm({ ...completeForm, diagnosis: e.target.value })}
                        placeholder="Diagnosis" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      <textarea value={completeForm.notes} onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                        placeholder="Consultation notes..." rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                      <input type="date" value={completeForm.followUpDate} onChange={(e) => setCompleteForm({ ...completeForm, followUpDate: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                      <div className="flex gap-2">
                        <button onClick={() => handleComplete(a._id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                          Complete
                        </button>
                        <button onClick={() => setCompleting(null)} className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setCompleting(a._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
                        <FiCheckCircle className="w-4 h-4" /> Mark Complete
                      </button>
                      <button onClick={() => handleStatus(a._id, 'cancelled')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">
                        <FiX className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
