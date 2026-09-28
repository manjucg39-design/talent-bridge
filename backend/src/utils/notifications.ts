import mongoose from 'mongoose';
import Notification from '../models/Notification';

export async function createNotification(input: {
  userId: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type: 'opportunity' | 'event' | 'application' | 'assessment' | 'club' | 'scout' | 'training' | 'verification' | 'profile' | 'general';
  relatedId?: mongoose.Types.ObjectId | string;
}) {
  return Notification.create(input);
}