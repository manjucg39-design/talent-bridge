import mongoose, { Document, Schema } from 'mongoose';

export interface IClub extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  sports: string[];
  state: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  coaches: string[];
  ageGroups: string[];
  trainingDays: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isDemo: boolean;
}

const ClubSchema = new Schema<IClub>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  sports: [{ type: String }],
  state: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  coaches: [{ type: String }],
  ageGroups: [{ type: String }],
  trainingDays: [{ type: String }],
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IClub>('Club', ClubSchema);
