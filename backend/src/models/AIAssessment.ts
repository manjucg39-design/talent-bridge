import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAssessment extends Document {
  studentId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  performanceScore: number;
  potentialFlag: boolean;
  improvementFlag: boolean;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendation: string;
  assessmentType: 'preliminary';
  confidenceScore: number;
  createdAt: Date;
}

const AIAssessmentSchema = new Schema<IAIAssessment>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'FitnessTest', required: true },
  performanceScore: { type: Number, required: true },
  potentialFlag: { type: Boolean, default: false },
  improvementFlag: { type: Boolean, default: false },
  strengthAreas: [{ type: String }],
  improvementAreas: [{ type: String }],
  recommendation: { type: String, default: '' },
  assessmentType: { type: String, default: 'preliminary' },
  confidenceScore: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IAIAssessment>('AIAssessment', AIAssessmentSchema);
