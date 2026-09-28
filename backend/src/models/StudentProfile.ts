import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  teacherId?: mongoose.Types.ObjectId;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  school: string;
  sportInterests: string[];
  parentConsent: boolean;
  profilePhoto: string;
  bio: string;
  potentialFlag: boolean;
  improvementFlag: boolean;
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  school: { type: String, required: true },
  sportInterests: [{ type: String }],
  parentConsent: { type: Boolean, default: false },
  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  potentialFlag: { type: Boolean, default: false },
  improvementFlag: { type: Boolean, default: false },
  overallScore: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
