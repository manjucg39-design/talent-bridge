"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification_1.default.find({ userId: req.user?.id }).sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification_1.default.countDocuments({ userId: req.user?.id, read: false });
        res.json({ success: true, data: notifications, unreadCount });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
const markRead = async (req, res) => {
    try {
        await Notification_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, { read: true });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update' });
    }
};
exports.markRead = markRead;
const markAllRead = async (req, res) => {
    try {
        await Notification_1.default.updateMany({ userId: req.user?.id, read: false }, { read: true });
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update' });
    }
};
exports.markAllRead = markAllRead;
