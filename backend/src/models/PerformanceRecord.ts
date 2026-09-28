import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceRecord extends Document {
  testId?: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  sport: string;
  metric: string;
  value: number;
  unit: string;
  date: Date;
  source: 'fitness_test' | 'competition' | 'training' | 'manual';
}

const PerformanceRecordSchema = new Schema<IPerformanceRecord>({
  testId: { type: Schema.Types.ObjectId, ref: 'FitnessTest' },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sport: { type: String, required: true },
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: Date, default: Date.now },
  source: { type: String, enum: ['fitness_test', 'competition', 'training', 'manual'], default: 'fitness_test' },
}, { timestamps: true });

export default mongoose.model<IPerformanceRecord>('PerformanceRecord', PerformanceRecordSchema);
