import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const VideoCall = () => {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const jitsiContainer = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const timerRef = useRef(null);

  const doctorName = searchParams.get('doctor') || 'Doctor';
  const roomName = `healthai-${appointmentId}`;

  // Load Jitsi script
  useEffect(() => {
    // Check if already loaded
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Jitsi script');
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Init Jitsi when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !jitsiContainer.current || jitsiApiRef.current) return;

    try {
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: roomName,
        parentNode: jitsiContainer.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'chat', 'raisehand',
            'tileview', 'fullscreen',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#0f172a',
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          HIDE_INVITE_MORE_HEADER: true,
          MOBILE_APP_PROMO: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        },
        userInfo: {
          displayName: user?.name || 'User',
          email: user?.email || '',
        },
      });

      jitsiApiRef.current = api;

      api.addEventListener('videoConferenceJoined', () => {
        setLoading(false);
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      });

      api.addEventListener('readyToClose', () => {
        handleEndCall();
      });

      // Fallback: hide loading after 5 seconds even if event doesn't fire
      setTimeout(() => {
        setLoading(false);
      }, 5000);

    } catch (err) {
      console.error('Jitsi init error:', err);
      setLoading(false);
    }
  }, [scriptLoaded]);

  const toggleAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
      setAudioMuted(!audioMuted);
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
      setVideoMuted(!videoMuted);
    }
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setShowEndModal(false);
    navigate(-1);
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
              {!loading && callDuration > 0 && (
                <span className="flex items-center gap-1">
                  <FiClock size={10} /> {formatDuration(callDuration)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FiVideo size={12} />
          <span>Encrypted • Secure Call</span>
        </div>
      </motion.div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-20 bg-dark flex items-center justify-center pointer-events-none"
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
                <p className="text-gray-500 text-sm">Setting up secure connection with Dr. {doctorName}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jitsi Container - always rendered */}
        <div ref={jitsiContainer} className="w-full h-full" style={{ minHeight: '400px' }} />
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 bg-dark/90 backdrop-blur-xl border-t border-white/10 px-6 py-4"
      >
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`p-4 rounded-2xl transition-all ${
              audioMuted
                ? 'bg-danger/20 text-danger border border-danger/30'
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
            }`}
          >
            {audioMuted ? <FiMicOff size={22} /> : <FiMic size={22} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all ${
              videoMuted
                ? 'bg-danger/20 text-danger border border-danger/30'
                : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
            }`}
          >
            {videoMuted ? <FiVideoOff size={22} /> : <FiVideo size={22} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEndModal(true)}
            className="p-4 px-8 rounded-2xl bg-danger text-white shadow-lg shadow-danger/30 hover:bg-danger/90 transition-all"
          >
            <FiPhoneOff size={22} />
          </motion.button>
        </div>
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
