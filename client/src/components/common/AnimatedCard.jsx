import { motion } from 'framer-motion';

const AnimatedCard = ({ children, className = '', delay = 0, hover = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    whileHover={hover ? { y: -5, scale: 1.02, transition: { duration: 0.2 } } : {}}
    whileTap={hover ? { scale: 0.98 } : {}}
    className={`bg-dark-light rounded-2xl border border-white/10 ${className}`}
  >
    {children}
  </motion.div>
);

export default AnimatedCard;
