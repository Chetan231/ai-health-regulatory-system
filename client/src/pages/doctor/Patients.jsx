import { useState, useEffect } from 'react';
import { getMyPatients } from '../../api/doctorApi';
import { FiSearch, FiUser, FiHeart, FiAlertTriangle, FiChevronRight } from 'react-icons/fi';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await getMyPatients({ search: searchTerm, limit: 20 });
      setPatients(res.data.data.patients);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatients(search);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-500 mt-1">View and manage your patient list</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients by name or email..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
          Search
        </button>
      </form>

      <div className="flex gap-6">
        {/* Patient List */}
        <div className={`${selectedPatient ? 'hidden md:block md:w-1/2 lg:w-2/5' : 'w-full'} space-y-3`}>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
          ) : patients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <FiUser className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No patients found</p>
            </div>
          ) : (
            patients.map((p) => (
              <button key={p.user._id} onClick={() => setSelectedPatient(p)}
                className={`w-full bg-white rounded-2xl border p-4 text-left hover:shadow-sm transition flex items-center gap-4 ${
                  selectedPatient?.user._id === p.user._id ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-100'
                }`}>
                <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                  {p.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.user.email}</p>
                  <div className="flex gap-2 mt-1">
                    {p.profile?.gender && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p.profile.gender}</span>}
                    {p.profile?.bloodGroup && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{p.profile.bloodGroup}</span>}
                    {p.latestVitals?.alerts?.length > 0 && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <FiAlertTriangle className="w-2.5 h-2.5" /> Alert
                      </span>
                    )}
                  </div>
                </div>
                <FiChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Patient Detail Panel */}
        {selectedPatient && (
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 sticky top-20 self-start">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {selectedPatient.user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPatient.user.name}</h2>
                  <p className="text-sm text-gray-500">{selectedPatient.user.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="md:hidden text-gray-400 hover:text-gray-600 text-sm">
                ✕ Close
              </button>
            </div>

            {/* Patient Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Personal Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{selectedPatient.profile?.gender || '—'}</span></div>
                  <div><span className="text-gray-500">Blood:</span> <span className="font-medium">{selectedPatient.profile?.bloodGroup || '—'}</span></div>
                  <div><span className="text-gray-500">DOB:</span> <span className="font-medium">{formatDate(selectedPatient.profile?.dateOfBirth)}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedPatient.user.phone || '—'}</span></div>
                  <div><span className="text-gray-500">Height:</span> <span className="font-medium">{selectedPatient.profile?.height ? `${selectedPatient.profile.height} cm` : '—'}</span></div>
                  <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{selectedPatient.profile?.weight ? `${selectedPatient.profile.weight} kg` : '—'}</span></div>
                </div>
              </div>

              {selectedPatient.profile?.allergies?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Allergies</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.profile.allergies.map((a, i) => (
                      <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPatient.profile?.chronicConditions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Chronic Conditions</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.profile.chronicConditions.map((c, i) => (
                      <span key={i} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Vitals */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <FiHeart className="w-4 h-4 text-pink-500" /> Latest Vitals
                </h3>
                {selectedPatient.latestVitals ? (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPatient.latestVitals.bloodPressure?.systolic && (
                      <div className="p-2 bg-red-50 rounded-lg text-xs">
                        <span className="text-red-600 font-medium">BP</span>
                        <p className="font-bold text-gray-900">{selectedPatient.latestVitals.bloodPressure.systolic}/{selectedPatient.latestVitals.bloodPressure.diastolic}</p>
                      </div>
                    )}
                    {selectedPatient.latestVitals.heartRate && (
                      <div className="p-2 bg-pink-50 rounded-lg text-xs">
                        <span className="text-pink-600 font-medium">Heart Rate</span>
                        <p className="font-bold text-gray-900">{selectedPatient.latestVitals.heartRate} bpm</p>
                      </div>
                    )}
                    {selectedPatient.latestVitals.oxygenSaturation && (
                      <div className="p-2 bg-blue-50 rounded-lg text-xs">
                        <span className="text-blue-600 font-medium">SpO₂</span>
                        <p className="font-bold text-gray-900">{selectedPatient.latestVitals.oxygenSaturation}%</p>
                      </div>
                    )}
                    {selectedPatient.latestVitals.temperature && (
                      <div className="p-2 bg-orange-50 rounded-lg text-xs">
                        <span className="text-orange-600 font-medium">Temp</span>
                        <p className="font-bold text-gray-900">{selectedPatient.latestVitals.temperature}°F</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No vitals recorded</p>
                )}
                {selectedPatient.latestVitals?.alerts?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedPatient.latestVitals.alerts.map((a, i) => (
                      <div key={i} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                        a.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        <FiAlertTriangle className="w-3 h-3" /> {a.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
