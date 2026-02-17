import { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, deleteUser } from '../../api/adminApi';
import toast from 'react-hot-toast';
import { FiSearch, FiCheck, FiX, FiTrash2, FiShield } from 'react-icons/fi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => { load(); }, [role]);

  const load = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await getUsers({ role: role || undefined, search: searchTerm || undefined });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); load(search); };

  const handleToggleStatus = async (id, current) => {
    try {
      await updateUserStatus(id, { isVerified: !current });
      toast.success(`User ${!current ? 'activated' : 'deactivated'}`);
      load(search);
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      load(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const roleBadge = (r) => ({
    patient: 'bg-blue-100 text-blue-700',
    doctor: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-violet-100 text-violet-700',
  }[r] || 'bg-gray-100 text-gray-700');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">View and manage all system users</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition">Search</button>
        </form>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {['', 'patient', 'doctor', 'admin'].map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition capitalize ${
                role === r ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>{r || 'All'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Joined</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600 text-sm">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isVerified ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleStatus(u._id, u.isVerified)} title={u.isVerified ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-lg transition ${u.isVerified ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}>
                          {u.isVerified ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u._id)} title="Delete"
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <p className="text-center text-gray-400 py-12">No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
