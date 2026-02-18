import { motion } from 'framer-motion';
import { useState } from 'react';

const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`space-y-1.5 ${className}`}
    >
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <motion.div
            animate={{ color: focused ? '#0ea5e9' : '#64748b' }}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <Icon size={18} />
          </motion.div>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-dark border rounded-xl px-4 py-3 text-white text-sm
            placeholder:text-gray-500 outline-none transition-all duration-300
            ${Icon ? 'pl-10' : ''}
            ${focused ? 'border-primary shadow-[0_0_15px_rgba(14,165,233,0.15)]' : 'border-white/10'}
            ${error ? 'border-danger' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-danger text-xs"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;
