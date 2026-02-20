import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

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
