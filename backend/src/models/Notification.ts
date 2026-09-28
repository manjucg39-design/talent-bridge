import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'opportunity' | 'event' | 'application' | 'assessment' | 'club' | 'scout' | 'training' | 'verification' | 'profile' | 'general';
  read: boolean;
  relatedId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['opportunity', 'event', 'application', 'assessment', 'club', 'scout', 'training', 'verification', 'profile', 'general'], default: 'general' },
  read: { type: Boolean, default: false },
  relatedId: { type: Schema.Types.ObjectId },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
