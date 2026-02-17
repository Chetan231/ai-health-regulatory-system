import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { getMyChats, getMessages, sendMessageApi, createChat } from '../../api/chatApi';
import { listDoctors } from '../../api/doctorApi';
import toast from 'react-hot-toast';
import { FiSend, FiMessageCircle, FiPlus, FiSearch, FiArrowLeft } from 'react-icons/fi';

const Chat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [typing, setTyping] = useState('');
  const msgEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => { loadChats(); }, []);

  useEffect(() => {
    if (!socket || !selectedChat) return;
    socket.emit('join_chat', selectedChat._id);

    const handleMsg = (msg) => {
      if (msg.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
      loadChats(); // refresh last message
    };
    const handleTyping = ({ chatId, userName }) => {
      if (chatId === selectedChat._id) setTyping(`${userName} is typing...`);
    };
    const handleStopTyping = () => setTyping('');

    socket.on('receive_message', handleMsg);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.emit('leave_chat', selectedChat._id);
      socket.off('receive_message', handleMsg);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, selectedChat]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadChats = async () => {
    try {
      const res = await getMyChats();
      setChats(res.data.data.chats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await getMessages(chat._id);
      setMessages(res.data.data.messages);
    } catch (err) { toast.error('Failed to load messages'); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedChat) return;

    try {
      const res = await sendMessageApi(selectedChat._id, { content: newMsg });
      setMessages((prev) => [...prev, res.data.data.message]);
      setNewMsg('');
      socket?.emit('send_message', { ...res.data.data.message, chatId: selectedChat._id });
      socket?.emit('stop_typing', { chatId: selectedChat._id });
      loadChats();
    } catch (err) { toast.error('Failed to send'); }
  };

  const handleTypingInput = (e) => {
    setNewMsg(e.target.value);
    if (socket && selectedChat) {
      socket.emit('typing', { chatId: selectedChat._id, userName: user.name });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId: selectedChat._id });
      }, 2000);
    }
  };

  const startNewChat = async () => {
    setShowNewChat(true);
    try {
      const res = await listDoctors({ available: 'true', limit: 50 });
      setDoctors(res.data.data.doctors);
    } catch (err) { toast.error('Failed to load doctors'); }
  };

  const initiateChat = async (doctorUserId) => {
    try {
      const res = await createChat(doctorUserId);
      setShowNewChat(false);
      setChats((prev) => {
        const exists = prev.find((c) => c._id === res.data.data.chat._id);
        return exists ? prev : [res.data.data.chat, ...prev];
      });
      selectChat(res.data.data.chat);
    } catch (err) { toast.error('Failed to create chat'); }
  };

  const getOther = (chat) => chat.participants?.find((p) => p._id !== user.id);
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const filteredDoctors = doctors.filter((d) =>
    d.userId?.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
        <div className="flex h-full">
          {/* Chat List */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Messages</h2>
              <button onClick={startNewChat} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><FiPlus className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
              ) : chats.length === 0 ? (
                <div className="text-center py-12 text-gray-400 px-4">
                  <FiMessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                  <button onClick={startNewChat} className="text-blue-600 text-sm mt-1 hover:underline">Start a chat →</button>
                </div>
              ) : chats.map((chat) => {
                const other = getOther(chat);
                return (
                  <button key={chat._id} onClick={() => selectChat(chat)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition border-b border-gray-50 ${
                      selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                    }`}>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm flex-shrink-0">
                      {other?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {other?.role === 'doctor' ? 'Dr. ' : ''}{other?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-gray-400">{formatTime(chat.lastMessage.createdAt || chat.updatedAt)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 text-gray-400"><FiArrowLeft className="w-5 h-5" /></button>
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                    {getOther(selectedChat)?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {getOther(selectedChat)?.role === 'doctor' ? 'Dr. ' : ''}{getOther(selectedChat)?.name}
                    </p>
                    {typing && <p className="text-xs text-green-500">{typing}</p>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => {
                    const isMe = (msg.sender?._id || msg.sender) === user.id;
                    return (
                      <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                  <input type="text" value={newMsg} onChange={handleTypingInput} placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  <button type="submit" disabled={!newMsg.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FiMessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p>Select a conversation or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">New Conversation</h2>
              <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} placeholder="Search doctor..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredDoctors.map((d) => (
                <button key={d._id} onClick={() => initiateChat(d.userId?._id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition text-left">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                    {d.userId?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Dr. {d.userId?.name}</p>
                    <p className="text-xs text-gray-500">{d.specialization}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
