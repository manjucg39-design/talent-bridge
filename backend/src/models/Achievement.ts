import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  type: 'certificate' | 'medal' | 'competition_result' | 'personal_best' | 'participation';
  organization: string;
  date: Date;
  result: string;
  certificateUrl: string;
  verified: boolean;
}

const AchievementSchema = new Schema<IAchievement>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['certificate', 'medal', 'competition_result', 'personal_best', 'participation'], required: true },
  organization: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  result: { type: String, default: '' },
  certificateUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
