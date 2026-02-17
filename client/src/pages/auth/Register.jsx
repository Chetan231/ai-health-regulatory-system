import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registerUser } from '../../api/authApi';
import toast from 'react-hot-toast';
import { FiActivity, FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = role selection, 2 = form
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', qualification: '', licenseNumber: '', experience: '', consultationFee: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectRole = (r) => {
    setRole(r);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, role };
      const { data } = await registerUser(payload);
      login(data.data.token, data.data.user);
      toast.success('Registration successful!');
      navigate(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500 to-blue-600 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FiActivity className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold">HealthAI</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Join HealthAI</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Create your account and get access to AI-powered health monitoring, smart diagnostics, and seamless healthcare management.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiActivity className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">HealthAI</span>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-500 mb-8">Choose your role to get started</p>

              <div className="space-y-4">
                <button onClick={() => selectRole('patient')} className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition text-left group">
                  <div className="text-3xl mb-2">🏥</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">I'm a Patient</h3>
                  <p className="text-sm text-gray-500">Track health, book appointments, get AI insights</p>
                </button>

                <button onClick={() => selectRole('doctor')} className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition text-left group">
                  <div className="text-3xl mb-2">👨‍⚕️</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">I'm a Doctor</h3>
                  <p className="text-sm text-gray-500">Manage patients, prescriptions, consultations</p>
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-blue-600 mb-4 flex items-center gap-1">
                ← Change role
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sign Up as {role === 'patient' ? 'Patient' : 'Doctor'}
              </h1>
              <p className="text-gray-500 mb-6">Fill in your details</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>

                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="Email Address"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>

                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="Password (min 6 chars)"
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>

                {role === 'doctor' && (
                  <>
                    <input type="text" name="specialization" value={form.specialization} onChange={handleChange} required placeholder="Specialization (e.g. Cardiology)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    <input type="text" name="qualification" value={form.qualification} onChange={handleChange} required placeholder="Qualification (e.g. MBBS, MD)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required placeholder="Medical License Number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="Years of Experience"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                      <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange} placeholder="Consultation Fee (₹)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
              </p>
            </>
          )}

          <p className="text-center mt-4">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
