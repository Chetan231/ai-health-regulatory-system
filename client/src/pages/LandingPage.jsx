import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiShield, FiHeart, FiUsers, FiFileText, FiCpu, FiArrowRight, FiCheck } from 'react-icons/fi';

const features = [
  { icon: FiHeart, title: 'Health Monitoring', desc: 'Track vitals, reports & prescriptions in real-time', color: 'text-danger' },
  { icon: FiCpu, title: 'AI-Powered Analysis', desc: 'Smart symptom checking & report summarization', color: 'text-primary' },
  { icon: FiFileText, title: 'Complete Reports', desc: 'Blood tests, imaging, ECG — all in one place', color: 'text-success' },
  { icon: FiUsers, title: 'Multi-Role System', desc: 'Patients, Doctors & Hospital Admins', color: 'text-secondary' },
  { icon: FiShield, title: 'Secure & Private', desc: 'Role-based access with encrypted data', color: 'text-warning' },
  { icon: FiActivity, title: 'Live Dashboard', desc: 'Animated real-time health analytics', color: 'text-accent' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-dark text-white overflow-hidden">
    {/* Navbar */}
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-9 h-9 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center"
          >
            <FiActivity size={20} />
          </motion.div>
          <span className="text-xl font-bold gradient-text">HealthAI</span>
        </motion.div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Sign In
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 text-sm bg-gradient-to-r from-primary to-secondary rounded-xl font-medium"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>

    {/* Hero */}
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      {/* Animated blobs */}
      <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full"
          >
            🏥 AI-Powered Health Monitoring System
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Your Health,{' '}
            <span className="gradient-text">Intelligently</span>{' '}
            Managed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
          >
            A complete AI-powered health regulatory system for patients, doctors, and hospital administrators. Monitor vitals, manage reports, and get AI-driven health insights — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(14,165,233,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-base flex items-center gap-2"
              >
                Get Started <FiArrowRight />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 border border-white/10 rounded-xl font-medium hover:bg-white/5 transition-colors"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { num: '10K+', label: 'Patients' },
            { num: '500+', label: 'Doctors' },
            { num: '99.9%', label: 'Uptime' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="text-center"
            >
              <motion.p
                className="text-2xl font-bold gradient-text"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 + i * 0.15, type: 'spring' }}
              >
                {stat.num}
              </motion.p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{' '}
            <span className="gradient-text">Health Management</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            From appointment booking to AI-powered diagnostics — a complete healthcare ecosystem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass rounded-2xl p-6 group cursor-default"
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${feature.color} group-hover:bg-white/10 transition-colors`}
              >
                <feature.icon size={24} />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden"
      >
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl"
        />
        <h2 className="text-3xl font-bold mb-4 relative z-10">Ready to Transform Healthcare?</h2>
        <p className="text-gray-400 mb-8 relative z-10">Join thousands of healthcare professionals using HealthAI.</p>
        <Link to="/register">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(14,165,233,0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-medium text-lg relative z-10"
          >
            Get Started for Free
          </motion.button>
        </Link>
      </motion.div>
    </section>

    {/* Footer */}
    <footer className="border-t border-white/10 py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
        <p>© 2026 HealthAI. All rights reserved.</p>
        <div className="flex items-center gap-1">
          Made with <FiHeart className="text-danger" size={14} /> for better healthcare
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
