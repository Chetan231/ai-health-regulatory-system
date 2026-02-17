import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';
import { getIO } from '../config/socket.js';

// @desc    Create or get existing chat
// @route   POST /api/chat
export const createChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return sendError(res, 400, 'participantId is required');

    // Check existing chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 },
    }).populate('participants', 'name email avatar role')
      .populate('lastMessage');

    if (!chat) {
      chat = await Chat.create({ participants: [req.user._id, participantId] });
      chat = await Chat.findById(chat._id)
        .populate('participants', 'name email avatar role')
        .populate('lastMessage');
    }

    sendResponse(res, 200, 'Chat', { chat });
  } catch (error) { next(error); }
};

// @desc    Get my chats
// @route   GET /api/chat
export const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name email avatar role')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } })
      .sort({ updatedAt: -1 });

    sendResponse(res, 200, 'My chats', { chats });
  } catch (error) { next(error); }
};

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId/messages
export const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return sendError(res, 403, 'Not authorized');
    }

    const [messages, total] = await Promise.all([
      Message.find({ chatId: req.params.chatId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ chatId: req.params.chatId }),
    ]);

    // Mark messages as read
    await Message.updateMany(
      { chatId: req.params.chatId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    sendResponse(res, 200, 'Messages', {
      messages: messages.reverse(),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

// @desc    Send message (REST fallback)
// @route   POST /api/chat/:chatId/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { content, type, fileUrl } = req.body;
    if (!content && !fileUrl) return sendError(res, 400, 'Message content is required');

    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return sendError(res, 403, 'Not authorized');
    }

    const message = await Message.create({
      chatId: req.params.chatId,
      sender: req.user._id,
      content,
      type: type || 'text',
      fileUrl,
    });

    // Update last message
    chat.lastMessage = message._id;
    await chat.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    // Emit via socket
    try {
      const io = getIO();
      io.to(`chat_${req.params.chatId}`).emit('receive_message', populated);
    } catch {}

    sendResponse(res, 201, 'Message sent', { message: populated });
  } catch (error) { next(error); }
};
