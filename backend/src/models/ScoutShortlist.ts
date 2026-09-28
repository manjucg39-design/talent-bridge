import mongoose, { Document, Schema } from 'mongoose';

export interface IScoutShortlist extends Document {
  scoutId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'shortlisted' | 'evaluation_requested' | 'referred';
  notes: string;
  createdAt: Date;
}

const ScoutShortlistSchema = new Schema<IScoutShortlist>({
  scoutId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['shortlisted', 'evaluation_requested', 'referred'], default: 'shortlisted' },
  notes: { type: String, default: '' },
}, { timestamps: true });

ScoutShortlistSchema.index({ scoutId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IScoutShortlist>('ScoutShortlist', ScoutShortlistSchema);
