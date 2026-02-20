import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';

const StatsCard = ({ icon: Icon, label, value, change, color = 'primary', delay = 0, link }) => {
  const navigate = useNavigate();

  const colors = {
    primary: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 border-secondary/20 text-secondary',
    success: 'from-success/20 to-success/5 border-success/20 text-success',
    warning: 'from-warning/20 to-warning/5 border-warning/20 text-warning',
    danger: 'from-danger/20 to-danger/5 border-danger/20 text-danger',
    accent: 'from-accent/20 to-accent/5 border-accent/20 text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={() => link && navigate(link)}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 relative overflow-hidden ${link ? 'cursor-pointer' : ''}`}
    >
      {/* Background glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-10 -right-10 w-32 h-32 bg-current rounded-full blur-3xl opacity-10"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="p-2 rounded-xl bg-white/5"
          >
            <Icon size={22} />
          </motion.div>
          {change && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className={`text-xs font-medium ${change > 0 ? 'text-success' : 'text-danger'}`}
            >
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
            </motion.span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-white">
          <CountUp end={typeof value === 'number' ? value : 0} duration={2} delay={delay} />
          {typeof value === 'string' && value}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
