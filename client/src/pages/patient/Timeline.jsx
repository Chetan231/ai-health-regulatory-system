import { useState, useEffect } from 'react';
import { getHealthTimeline } from '../../api/patientApi';
import { FiHeart, FiAlertTriangle, FiChevronDown } from 'react-icons/fi';

const Timeline = () => {
  const [timeline, setTimeline] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadTimeline();
  }, [page]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await getHealthTimeline({ page, limit: 15 });
      if (page === 1) {
        setTimeline(res.data.data.timeline);
      } else {
        setTimeline((prev) => [...prev, ...res.data.data.timeline]);
      }
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const groupByDate = (items) => {
    const groups = {};
    items.forEach((item) => {
      const day = new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[day]) groups[day] = [];
      groups[day].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(timeline);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Health Timeline</h1>
        <p className="text-gray-500 mt-1">Your complete health journey at a glance</p>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : timeline.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FiHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Health Records Yet</h3>
          <p className="text-gray-400">Start by recording your vitals to build your health timeline.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{date}</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiHeart className="w-5 h-5 text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">Vitals Recorded</span>
                          <span className="text-xs text-gray-400">{new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {item.data.bloodPressure?.systolic && (
                            <span className="text-sm bg-red-50 text-red-700 px-2.5 py-1 rounded-lg">
                              BP: {item.data.bloodPressure.systolic}/{item.data.bloodPressure.diastolic}
                            </span>
                          )}
                          {item.data.heartRate && (
                            <span className="text-sm bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg">
                              HR: {item.data.heartRate} bpm
                            </span>
                          )}
                          {item.data.oxygenSaturation && (
                            <span className="text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                              SpO₂: {item.data.oxygenSaturation}%
                            </span>
                          )}
                          {item.data.temperature && (
                            <span className="text-sm bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg">
                              {item.data.temperature}°F
                            </span>
                          )}
                          {item.data.weight && (
                            <span className="text-sm bg-green-50 text-green-700 px-2.5 py-1 rounded-lg">
                              {item.data.weight} kg
                            </span>
                          )}
                        </div>

                        {item.alerts?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.alerts.map((a, j) => (
                              <span key={j} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                a.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                <FiAlertTriangle className="w-3 h-3" /> {a.message}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.data.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">"{item.data.notes}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          {pagination.page < pagination.pages && (
            <div className="text-center">
              <button onClick={() => setPage((p) => p + 1)} disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
                <FiChevronDown className="w-4 h-4" /> {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Timeline;
