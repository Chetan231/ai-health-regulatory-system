import { useState, useEffect } from 'react';
import { listDoctors } from '../../api/doctorApi';
import { FiSearch, FiStar, FiMapPin, FiFilter } from 'react-icons/fi';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    loadDoctors();
  }, [specFilter, sortBy]);

  const loadDoctors = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await listDoctors({ search: searchTerm, specialization: specFilter, sortBy, available: 'true' });
      setDoctors(res.data.data.doctors);
      setSpecializations(res.data.data.specializations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDoctors(search);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="text-gray-500 mt-1">Browse and book appointments with our specialists</p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by doctor name..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">Search</button>
        </form>

        <div className="flex gap-2">
          <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="">All Specializations</option>
            {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="fee">Lowest Fee</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <p className="text-lg">No doctors found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg flex-shrink-0">
                  {d.userId?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">Dr. {d.userId?.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{d.specialization}</p>
                  <p className="text-xs text-gray-500">{d.qualification}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium text-gray-900">{d.experience} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium text-gray-900">₹{d.consultationFee}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <FiStar className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {d.rating || 0} ({d.totalReviews || 0})
                  </span>
                </div>
                {d.departmentId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Department</span>
                    <span className="font-medium text-gray-900">{d.departmentId.name}</span>
                  </div>
                )}
              </div>

              {d.availability?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {d.availability.map((s, i) => (
                    <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {s.day} {s.startTime}-{s.endTime}
                    </span>
                  ))}
                </div>
              )}

              <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDoctors;
