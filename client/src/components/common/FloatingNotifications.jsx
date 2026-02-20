import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheckCircle, FiCalendar, FiFileText, FiHeart, FiDollarSign, FiInfo, FiX } from 'react-icons/fi';
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

const FloatingNotifications = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  if (!user) return null;

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50">
      {/* Floating Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(prev => !prev)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30 text-white flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX size={24} />
            </motion.span>
          ) : (
            <motion.span key="bell" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FiBell size={24} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-danger rounded-full text-xs text-white font-bold flex items-center justify-center border-2 border-dark"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when unread */}
        {unreadCount > 0 && !open && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[360px] max-h-[480px] bg-dark-light border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-dark/50">
              <div>
                <h3 className="text-white font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
              </div>
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
            </div>

            {/* List */}
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
                      className={`flex items-start gap-3 p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.03] ${!notif.isRead ? 'bg-primary/[0.03]' : ''}`}
                    >
                      <div className={`p-2 rounded-xl ${config.bg} ${config.color} flex-shrink-0 mt-0.5`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>{notif.title}</p>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-gray-600 mt-1">{dayjs(notif.createdAt).fromNow()}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-3">🔔</motion.div>
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                  <p className="text-gray-600 text-xs mt-1">You'll see updates here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingNotifications;
