import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiSearch, FiCheck, FiCheckCircle, FiCalendar, FiFileText, FiHeart, FiDollarSign, FiInfo, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const typeConfig = {
  appointment: { icon: FiCalendar, color: 'text-primary', bg: 'bg-primary/10' },
  report: { icon: FiFileText, color: 'text-success', bg: 'bg-success/10' },
  prescription: { icon: FiHeart, color: 'text-secondary', bg: 'bg-secondary/10' },
  billing: { icon: FiDollarSign, color: 'text-warning', bg: 'bg-warning/10' },
  system: { icon: FiInfo, color: 'text-accent', bg: 'bg-accent/10' },
};

const Navbar = () => {
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // silently fail
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      // silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // silently fail
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-dark/80 backdrop-blur-xl border-b border-white/10 px-6 py-3"
    >
      <div className="flex items-center justify-between">
        {/* Search */}
        <motion.div
          animate={{ width: searchFocused ? 400 : 300 }}
          className="relative"
        >
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search patients, reports, appointments..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-dark-light border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-primary transition-all"
          />
        </motion.div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleNotifications}
              className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <FiBell size={20} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-danger rounded-full text-[10px] text-white flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-96 max-h-[500px] bg-dark-light border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div>
                      <h3 className="text-white font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-primary-light flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10 transition-all"
                        >
                          <FiCheckCircle size={12} /> Mark all read
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-lg hover:bg-white/5 text-gray-500"
                      >
                        <FiX size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto max-h-[400px]">
                    {notifications.length > 0 ? (
                      notifications.map((notif, i) => {
                        const config = typeConfig[notif.type] || typeConfig.system;
                        const Icon = config.icon;

                        return (
                          <motion.div
                            key={notif._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                            className={`
                              flex items-start gap-3 p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.03]
                              ${!notif.isRead ? 'bg-primary/[0.03]' : ''}
                            `}
                          >
                            {/* Icon */}
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className={`p-2 rounded-xl ${config.bg} ${config.color} flex-shrink-0 mt-0.5`}
                            >
                              <Icon size={16} />
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                                  {notif.title}
                                </p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-gray-600 mt-1">{dayjs(notif.createdAt).fromNow()}</p>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl mb-3"
                        >
                          🔔
                        </motion.div>
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                        <p className="text-gray-600 text-xs mt-1">You'll see updates here</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-400"
          >
            Welcome, <span className="text-white font-medium">{user?.name}</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
