import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiCpu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const FloatingAIChat = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Namaste! 🙏 Main aapka AI Health Assistant hu. Aap mujhse health se related koi bhi sawaal pooch sakte hain.\n\nKaise madad kar sakta hu? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // don't close, let toggle button handle it
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'ai', text: data.reply, type: data.type }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, kuch problem ho gayi. Please dobara try karein. 🙏' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[380px] h-[520px] bg-dark-light border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10 px-4 py-3 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center"
              >
                <FiCpu className="text-white" size={18} />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">HealthAI Assistant</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Online
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={18} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      msg.role === 'user'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-gradient-to-r from-primary to-secondary text-white'
                    }`}>
                      {msg.role === 'user' ? (user?.name?.[0]?.toUpperCase() || 'U') : '🤖'}
                    </div>
                    <div className={`px-3 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : msg.type === 'emergency'
                          ? 'bg-danger/10 border border-danger/20 text-gray-200 rounded-bl-md'
                          : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing */}
              <AnimatePresence>
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-[10px]">🤖</div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-3 py-2.5">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Apna sawaal likhein..."
                  disabled={loading}
                  className="flex-1 bg-dark border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend size={16} />
                </motion.button>
              </div>
              <p className="text-[9px] text-gray-600 mt-1.5 text-center">⚠️ AI assistant hai, doctor ki jagah nahi le sakta</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(prev => !prev)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 text-white flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FiX size={24} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FiMessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingAIChat;
