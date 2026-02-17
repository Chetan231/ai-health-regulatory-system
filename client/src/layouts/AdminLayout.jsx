import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiActivity, FiHome, FiUsers, FiUserCheck, FiGrid, FiLayers,
  FiSettings, FiLogOut, FiMenu, FiX, FiBell
} from 'react-icons/fi';

const navItems = [
  { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/doctors-verify', icon: FiUserCheck, label: 'Doctor Verification' },
  { to: '/admin/departments', icon: FiGrid, label: 'Departments' },
  { to: '/admin/beds', icon: FiLayers, label: 'Bed Management' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-violet-600 rounded-lg flex items-center justify-center">
                <FiActivity className="text-white w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">HealthAI</span>
                <span className="text-[10px] ml-1.5 bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-medium">Admin</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600"><FiX className="w-5 h-5" /></button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive ? 'bg-violet-50 text-violet-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
              <FiLogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900"><FiMenu className="w-5 h-5" /></button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative"><FiBell className="w-5 h-5" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
