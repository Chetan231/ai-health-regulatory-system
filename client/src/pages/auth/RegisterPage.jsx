import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiActivity, FiUserCheck, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const roles = [
  { value: 'patient', label: 'Patient', icon: FiUser, desc: 'Book appointments & track health' },
  { value: 'doctor', label: 'Doctor', icon: FiUserCheck, desc: 'Manage patients & reports' },
  { value: 'admin', label: 'Admin', icon: FiShield, desc: 'Manage hospital system' },
];

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient', specialization: '', licenseNumber: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden py-10">
      {/* Background */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="flex flex-col items-center mb-6"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-primary/25"
            >
              <FiActivity className="text-white" size={26} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-gray-400 text-sm mt-1">Join HealthAI System</p>
          </motion.div>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {roles.map((role, i) => (
              <motion.button
                key={role.value}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setForm({ ...form, role: role.value })}
                className={`
                  p-3 rounded-xl border text-center transition-all duration-300
                  ${form.role === role.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 text-gray-400 hover:border-white/20'}
                `}
              >
                <role.icon size={20} className="mx-auto mb-1" />
                <p className="text-xs font-medium">{role.label}</p>
              </motion.button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" icon={FiUser} placeholder="Rahul Sharma" value={form.name} onChange={update('name')} required />
            <Input label="Email" icon={FiMail} type="email" placeholder="rahul@example.com" value={form.email} onChange={update('email')} required />
            <Input label="Phone" icon={FiPhone} placeholder="+1234567890" value={form.phone} onChange={update('phone')} />
            <Input label="Password" icon={FiLock} type="password" placeholder="Min 6 characters" value={form.password} onChange={update('password')} required />

            {/* Doctor fields */}
            <AnimatePresence>
              {form.role === 'doctor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input label="Specialization" placeholder="e.g. Cardiology" value={form.specialization} onChange={update('specialization')} required />
                  <Input label="License Number" placeholder="e.g. MED-12345" value={form.licenseNumber} onChange={update('licenseNumber')} required />
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-400 text-sm mt-5"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-medium">
              Sign In
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
