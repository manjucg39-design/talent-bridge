import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  opportunityId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'selected' | 'rejected';
  submittedAt: Date;
  documents: string[];
  notes: string;
}

const ApplicationSchema = new Schema<IApplication>({
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['submitted', 'under_review', 'shortlisted', 'selected', 'rejected'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
  documents: [{ type: String }],
  notes: { type: String, default: '' },
}, { timestamps: true });

ApplicationSchema.index({ opportunityId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
