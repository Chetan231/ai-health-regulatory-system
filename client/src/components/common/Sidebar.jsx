import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiCalendar, FiFileText, FiHeart, FiUsers,
  FiSettings, FiLogOut, FiActivity, FiDollarSign, FiGrid,
  FiUserPlus, FiBell, FiChevronLeft, FiMenu, FiCpu
} from 'react-icons/fi';
import { useState } from 'react';

const patientLinks = [
  { to: '/patient/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/patient/appointments', icon: FiCalendar, label: 'Appointments' },
  { to: '/patient/reports', icon: FiFileText, label: 'Reports' },
  { to: '/patient/prescriptions', icon: FiHeart, label: 'Prescriptions' },
  { to: '/patient/vitals', icon: FiActivity, label: 'Vitals' },
  { to: '/patient/billing', icon: FiDollarSign, label: 'Billing' },
  { to: '/patient/ai-health', icon: FiCpu, label: 'AI Assistant' },
];

const doctorLinks = [
  { to: '/doctor/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/doctor/appointments', icon: FiCalendar, label: 'Appointments' },
  { to: '/doctor/patients', icon: FiUsers, label: 'My Patients' },
  { to: '/doctor/reports', icon: FiFileText, label: 'Reports' },
  { to: '/doctor/prescriptions', icon: FiHeart, label: 'Prescriptions' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/admin/doctors', icon: FiUserPlus, label: 'Doctors' },
  { to: '/admin/departments', icon: FiGrid, label: 'Departments' },
  { to: '/admin/patients', icon: FiUsers, label: 'Patients' },
  { to: '/admin/analytics', icon: FiActivity, label: 'Analytics' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const links = user?.role === 'doctor' ? doctorLinks
    : user?.role === 'admin' ? adminLinks
    : patientLinks;

  const sidebarVariants = {
    expanded: { width: 256, transition: { duration: 0.3, ease: 'easeInOut' } },
    collapsed: { width: 80, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      className="fixed left-0 top-0 h-screen bg-dark-light border-r border-white/10 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center"
              >
                <FiActivity className="text-white" size={18} />
              </motion.div>
              <span className="font-bold text-white text-lg">HealthAI</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
        >
          {collapsed ? <FiMenu size={20} /> : <FiChevronLeft size={20} />}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link, i) => (
          <NavLink key={link.to} to={link.to}>
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative
                  ${isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <link.icon size={20} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 px-3 py-2 text-gray-400"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.button
          whileHover={{ x: 4, color: '#ef4444' }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full text-gray-400 rounded-xl hover:bg-white/5"
        >
          <FiLogOut size={20} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
