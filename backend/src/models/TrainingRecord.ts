import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainingRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  date: Date;
  activity: string;
  performance: string;
  coachNotes: string;
}

const TrainingRecordSchema = new Schema<ITrainingRecord>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
  date: { type: Date, default: Date.now },
  activity: { type: String, required: true },
  performance: { type: String, default: '' },
  coachNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<ITrainingRecord>('TrainingRecord', TrainingRecordSchema);
