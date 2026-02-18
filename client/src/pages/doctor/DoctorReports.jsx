import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiPlus, FiUser, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/common/AnimatedPage';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/reports');
        setReports(data.reports);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading reports..." />;

  return (
    <AnimatedPage>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">Medical <span className="gradient-text">Reports</span></h1>
          <p className="text-gray-400 mt-1">{reports.length} reports created</p>
        </motion.div>
        <Link to="/doctor/reports/create">
          <Button><FiPlus size={16} /> Create Report</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {reports.map((report, i) => (
          <motion.div
            key={report._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ x: 4 }}
            className="bg-dark-light rounded-2xl border border-white/10 p-5 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ rotate: 10 }} className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <FiFileText size={20} />
                </motion.div>
                <div>
                  <h3 className="text-white font-semibold">{report.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiUser size={11} /> {report.patient?.name}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={11} /> {dayjs(report.date).format('MMM D, YYYY')}</span>
                    <span className="capitalize px-2 py-0.5 bg-white/5 rounded-md">{report.type.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500">{report.results?.length || 0} parameters</span>
            </div>
          </motion.div>
        ))}
      </div>

      {reports.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">📋</motion.div>
          <p className="text-gray-400">No reports created yet</p>
        </motion.div>
      )}
    </AnimatedPage>
  );
};

export default DoctorReports;
