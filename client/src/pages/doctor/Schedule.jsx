import { useState, useEffect } from 'react';
import { getDoctorProfile, updateAvailability } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiClock } from 'react-icons/fi';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

const Schedule = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const res = await getDoctorProfile();
      setSlots(res.data.data.profile.availability || []);
    } catch (err) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    setSlots([...slots, { day: 'Mon', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvailability({ availability: slots });
      toast.success('Schedule updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  // Group by day for visual overview
  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter((s) => s.day === day);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-500 mt-1">Set your availability for appointments</p>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h2>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <div key={day} className="text-center">
              <p className="text-xs font-semibold text-gray-500 mb-2">{day}</p>
              <div className={`h-16 rounded-xl flex items-center justify-center text-xs ${
                grouped[day].length > 0 ? 'bg-emerald-50 text-emerald-700 font-medium' : 'bg-gray-50 text-gray-400'
              }`}>
                {grouped[day].length > 0 ? (
                  <div className="text-center">
                    {grouped[day].map((s, i) => (
                      <p key={i}>{s.startTime}-{s.endTime}</p>
                    ))}
                  </div>
                ) : 'Off'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Slots */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Time Slots</h2>
          <button onClick={addSlot} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition">
            <FiPlus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No time slots added yet</p>
            <p className="text-sm mt-1">Click "Add Slot" to set your availability</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  {DAYS.map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
                  <span className="text-gray-400">to</span>
                  <input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white" />
                </div>
                <button onClick={() => removeSlot(i)} className="p-2 text-gray-300 hover:text-red-500 transition ml-auto">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
          <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};

export default Schedule;
