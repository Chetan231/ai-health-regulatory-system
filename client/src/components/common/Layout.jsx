import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => (
  <div className="min-h-screen bg-dark text-white flex">
    <Sidebar />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 ml-[256px] transition-all duration-300"
    >
      <Navbar />
      <main className="p-6">
        <Outlet />
      </main>
    </motion.div>
  </div>
);

export default Layout;
