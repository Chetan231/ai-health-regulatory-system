import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiClock, FiMaximize } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const VideoCall = () => {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const timerRef = useRef(null);

  const doctorName = searchParams.get('doctor') || 'Doctor';
  // Use a clean, short room name (last 8 chars of appointment ID to keep it unique)
  const shortId = appointmentId.slice(-8);
  const roomName = `healthai${shortId}`;
  const displayName = encodeURIComponent(user?.name || 'User');

  // Free Jitsi server (no login required) - simple URL for reliable room joining
  const jitsiUrl = `https://jitsi.member.fsf.org/${roomName}`;

  useEffect(() => {
    // Start timer when component mounts
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowEndModal(false);
    navigate(-1);
  };

  const openFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      }
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-dark z-50 flex flex-col">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="relative z-10 bg-dark/90 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm"
          >
            {doctorName[0]?.toUpperCase()}
          </motion.div>
          <div>
            <h3 className="text-white font-semibold text-sm">Dr. {doctorName}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Online Consultation
              </motion.span>
              {callDuration > 0 && (
                <span className="flex items-center gap-1">
                  <FiClock size={10} /> {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-600 hidden md:inline font-mono">Room: {roomName}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openFullscreen}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Fullscreen"
          >
            <FiMaximize size={16} />
          </motion.button>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiVideo size={12} />
            <span className="hidden md:inline">Secure Call</span>
          </div>
        </div>
      </motion.div>

      {/* Video Container */}
      <div className="flex-1 relative bg-[#0f172a]">
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-20 bg-dark flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-primary/20"
                >
                  <FiVideo className="text-white" size={36} />
                </motion.div>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-white font-semibold text-lg mb-2"
                >
                  Connecting to call...
                </motion.p>
                <p className="text-gray-500 text-sm">Setting up secure video call</p>
                <motion.div
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-6 mx-auto max-w-xs"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jitsi iframe */}
        <iframe
          ref={iframeRef}
          src={jitsiUrl}
          onLoad={handleIframeLoad}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          allowFullScreen
        />
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 bg-dark/90 backdrop-blur-xl border-t border-white/10 px-6 py-4"
      >
        <div className="flex items-center justify-center gap-4">
          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEndModal(true)}
            className="p-4 px-8 rounded-2xl bg-danger text-white shadow-lg shadow-danger/30 hover:bg-danger/90 transition-all flex items-center gap-2"
          >
            <FiPhoneOff size={22} />
            <span className="text-sm font-medium">End Call</span>
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2">Use controls inside the video window • Allow camera & mic when prompted • Both users must click "Join" inside the call</p>
      </motion.div>

      {/* End Call Confirmation */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowEndModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-light rounded-2xl border border-white/10 p-6 max-w-sm mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-14 h-14 mx-auto bg-danger/20 rounded-2xl flex items-center justify-center mb-4"
              >
                <FiPhoneOff className="text-danger" size={28} />
              </motion.div>
              <h3 className="text-lg font-bold text-white text-center mb-2">End Call?</h3>
              <p className="text-sm text-gray-400 text-center mb-1">Call duration: {formatDuration(callDuration)}</p>
              <p className="text-xs text-gray-500 text-center mb-6">You'll be disconnected from the video consultation.</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white text-sm font-medium border border-white/10 hover:bg-white/10 transition-all"
                >
                  Continue Call
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEndCall}
                  className="flex-1 py-3 rounded-xl bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-all"
                >
                  End Call
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCall;
