import mongoose, { Document, Schema } from 'mongoose';

export interface IKIC extends Document {
  name: string;
  sports: string[];
  state: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  eligibility: string;
  trainingInfo: string;
  verificationStatus: 'pending' | 'verified';
  isDemo: boolean;
}

const KICSchema = new Schema<IKIC>({
  name: { type: String, required: true },
  sports: [{ type: String }],
  state: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  eligibility: { type: String, default: '' },
  trainingInfo: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
  isDemo: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IKIC>('KIC', KICSchema);
