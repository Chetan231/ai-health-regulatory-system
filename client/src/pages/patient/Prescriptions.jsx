import { useState, useEffect } from 'react';
import { getPrescriptions } from '../../api/prescriptionApi';
import { FiFileText, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadPrescriptions(); }, [filter]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'active') params.active = 'true';
      if (filter === 'inactive') params.active = 'false';
      const res = await getPrescriptions(params);
      setPrescriptions(res.data.data.prescriptions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500 mt-1">View prescriptions from your doctors</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'active', 'inactive'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <button onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. {p.doctorId?.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span>{formatDate(p.createdAt)}</span>
                      <span>{p.medicines.length} medicine{p.medicines.length > 1 ? 's' : ''}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {p.diagnosis && <p className="text-sm text-blue-600 mt-0.5">{p.diagnosis}</p>}
                  </div>
                </div>
                {expanded === p._id ? <FiChevronUp className="w-5 h-5 text-gray-400" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {expanded === p._id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-2 font-medium">Medicine</th>
                        <th className="pb-2 font-medium">Dosage</th>
                        <th className="pb-2 font-medium">Frequency</th>
                        <th className="pb-2 font-medium">Duration</th>
                        <th className="pb-2 font-medium">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.medicines.map((m, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2.5 font-medium text-gray-900">{m.name}</td>
                          <td className="py-2.5 text-gray-600">{m.dosage}</td>
                          <td className="py-2.5 text-gray-600">{m.frequency}</td>
                          <td className="py-2.5 text-gray-600">{m.duration}</td>
                          <td className="py-2.5 text-gray-500 text-xs">{m.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {p.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                      <p className="text-xs font-medium text-yellow-700">Doctor's Notes:</p>
                      <p className="text-sm text-gray-700 mt-0.5">{p.notes}</p>
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

export default Prescriptions;
