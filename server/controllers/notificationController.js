import Notification from '../models/Notification.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';
import { sendNotification as pushNotification } from '../config/socket.js';

// @desc    Get notifications
// @route   GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments({ userId: req.user._id }),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);

    sendResponse(res, 200, 'Notifications', { notifications, unreadCount, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// @desc    Mark as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
    sendResponse(res, 200, 'Marked as read');
  } catch (error) { next(error); }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    sendResponse(res, 200, 'All marked as read');
  } catch (error) { next(error); }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    sendResponse(res, 200, 'Deleted');
  } catch (error) { next(error); }
};

// Helper: Create and push notification
export const createNotification = async (userId, { title, message, type, link }) => {
  const notification = await Notification.create({ userId, title, message, type, link });
  pushNotification(userId.toString(), notification);
  return notification;
};
