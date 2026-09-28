import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  studentId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  testId?: mongoose.Types.ObjectId;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  consent: boolean;
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'FitnessTest' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  consent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IVideo>('Video', VideoSchema);
