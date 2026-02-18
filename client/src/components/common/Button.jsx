import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white',
  secondary: 'bg-dark-light border border-white/10 hover:border-primary/50 text-white',
  danger: 'bg-danger/20 border border-danger/30 hover:bg-danger/30 text-danger',
  success: 'bg-success/20 border border-success/30 hover:bg-success/30 text-success',
  ghost: 'hover:bg-white/5 text-gray-custom hover:text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    className={`
      ${variants[variant]} ${sizes[size]}
      rounded-xl font-medium transition-all duration-300
      flex items-center justify-center gap-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <motion.div
        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    )}
    {children}
  </motion.button>
);

export default Button;
