import mongoose, { Document, Schema } from 'mongoose';

export interface IFitnessTest extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  testType: 'sprint' | 'jump' | 'endurance' | 'agility' | 'strength';
  sport: string;
  measurements: Record<string, number | string>;
  score: number;
  videoId?: mongoose.Types.ObjectId;
  testDate: Date;
  notes: string;
  verified: boolean;
  createdAt: Date;
}

const FitnessTestSchema = new Schema<IFitnessTest>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testType: { type: String, enum: ['sprint', 'jump', 'endurance', 'agility', 'strength'], required: true },
  sport: { type: String, required: true },
  measurements: { type: Schema.Types.Mixed, default: {} },
  score: { type: Number, default: 0 },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video' },
  testDate: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IFitnessTest>('FitnessTest', FitnessTestSchema);
