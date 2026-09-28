import mongoose, { Document, Schema } from 'mongoose';

export interface IOpportunity extends Document {
  organizationId: mongoose.Types.ObjectId;
  title: string;
  type: string;
  sport: string;
  description: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  location: string;
  state: string;
  district: string;
  ageMin: number;
  ageMax: number;
  gender: 'male' | 'female' | 'all';
  eligibility: string;
  documents: string[];
  selectionProcess: string;
  applicationUrl: string;
  contactEmail: string;
  contactPhone: string;
  slots: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  status: 'draft' | 'published' | 'closed';
  isDemo: boolean;
  createdAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  sport: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  location: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, default: '' },
  ageMin: { type: Number, required: true },
  ageMax: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'all'], default: 'all' },
  eligibility: { type: String, default: '' },
  documents: [{ type: String }],
  selectionProcess: { type: String, default: '' },
  applicationUrl: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  slots: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  isDemo: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
