export type UserRole = 'STUDENT' | 'PE_TEACHER' | 'CLUB' | 'SCOUT' | 'GOVERNMENT_ORGANIZATION' | 'ADMIN';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  state: string;
  district: string;
  location?: string;
  isVerified: boolean;
  isActive: boolean;
  verificationStatus?: string;
  verificationNotes?: string;
  phone?: string;
  createdAt?: string;
}

export interface StudentProfile {
  _id: string;
  userId: User;
  dateOfBirth: string;
  gender: string;
  school: string;
  sportInterests: string[];
  parentConsent: boolean;
  profilePhoto: string;
  bio: string;
  potentialFlag: boolean;
  improvementFlag: boolean;
  overallScore: number;
}

export interface FitnessTest {
  _id: string;
  studentId: string;
  teacherId: string;
  testType: string;
  sport: string;
  measurements: Record<string, number | string>;
  score: number;
  testDate: string;
  notes: string;
  verified: boolean;
}

export interface AIAssessment {
  _id: string;
  studentId: string;
  testId: string;
  performanceScore: number;
  potentialFlag: boolean;
  improvementFlag: boolean;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendation: string;
  assessmentType: string;
  confidenceScore: number;
  createdAt: string;
}

export interface Opportunity {
  _id: string;
  organizationId: { _id: string; name: string };
  title: string;
  type: string;
  sport: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  state: string;
  district: string;
  ageMin: number;
  ageMax: number;
  gender: string;
  eligibility: string;
  documents: string[];
  selectionProcess: string;
  applicationUrl: string;
  contactEmail: string;
  contactPhone: string;
  slots: number;
  verificationStatus: string;
  status: string;
  isDemo: boolean;
  matchScore?: number;
  matchReasons?: string[];
  eligible?: boolean;
}

export interface Club {
  _id: string;
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
  verificationStatus: string;
  isDemo: boolean;
}

export interface KIC {
  _id: string;
  name: string;
  sports: string[];
  state: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  eligibility: string;
  trainingInfo: string;
  verificationStatus: string;
  isDemo: boolean;
}

export interface Application {
  _id: string;
  opportunityId: Opportunity;
  studentId: string;
  status: string;
  submittedAt: string;
  documents: string[];
  notes: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface PerformanceRecord {
  _id: string;
  studentId: string;
  sport: string;
  metric: string;
  value: number;
  unit: string;
  date: string;
  source: string;
}

export interface Achievement {
  _id: string;
  studentId: string;
  title: string;
  type: string;
  organization: string;
  date: string;
  result: string;
  certificateUrl: string;
  verified: boolean;
}

export interface ScoutShortlist {
  _id: string;
  scoutId: string;
  studentId: StudentProfile;
  status: string;
  notes: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}
