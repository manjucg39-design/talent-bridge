import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user?.id, read: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ userId: req.user?.id, read: false }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
};
