import { Link } from 'react-router-dom';
import { FiActivity, FiUsers, FiShield, FiHeart, FiMonitor, FiMessageCircle } from 'react-icons/fi';

const features = [
  { icon: <FiActivity className="w-8 h-8" />, title: 'AI Health Monitoring', desc: 'Real-time vitals tracking with AI-powered alerts and risk prediction.' },
  { icon: <FiUsers className="w-8 h-8" />, title: 'Doctor-Patient Connect', desc: 'Book appointments, video consult, and chat with doctors seamlessly.' },
  { icon: <FiShield className="w-8 h-8" />, title: 'Smart Diagnosis', desc: 'AI-assisted symptom checking and diagnosis suggestions.' },
  { icon: <FiHeart className="w-8 h-8" />, title: 'Health Timeline', desc: 'Complete health history from vitals to lab reports in one place.' },
  { icon: <FiMonitor className="w-8 h-8" />, title: 'Hospital Management', desc: 'Admin dashboard for staff, departments, beds, and billing.' },
  { icon: <FiMessageCircle className="w-8 h-8" />, title: 'Real-time Chat & Video', desc: 'Instant communication between patients and doctors.' },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <FiActivity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-900">HealthAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 py-20 md:py-32 text-center max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
          🤖 Powered by AI
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Your Health, <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Intelligently Managed
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          A complete AI-powered health regulatory system for patients, doctors, and hospital administrators. Monitor, diagnose, and manage — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-lg">
            Start Free →
          </Link>
          <Link to="/login" className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition text-lg">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything You Need</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          From patient health tracking to AI-powered diagnostics — a comprehensive healthcare solution.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="px-6 md:px-16 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Built For Everyone</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { role: 'Patients', emoji: '🏥', items: ['Track vitals & health history', 'AI symptom checker', 'Book appointments & video calls', 'View prescriptions & reports', 'Secure chat with doctors'] },
              { role: 'Doctors', emoji: '👨‍⚕️', items: ['Manage patient queue', 'AI-assisted diagnosis', 'Write digital prescriptions', 'Video consultations', 'Schedule management'] },
              { role: 'Admins', emoji: '🏢', items: ['Hospital analytics dashboard', 'Staff & department management', 'Bed allocation tracking', 'Billing & revenue reports', 'System-wide oversight'] },
            ].map((r, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-4xl mb-4">{r.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{r.role}</h3>
                <ul className="space-y-2.5">
                  {r.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-0.5">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-8 text-center text-gray-400 text-sm border-t border-gray-100">
        © {new Date().getFullYear()} HealthAI — AI Health Regulatory System. Capstone Project.
      </footer>
    </div>
  );
};

export default Landing;
