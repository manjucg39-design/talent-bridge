import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Opportunity from '../models/Opportunity';
import Application from '../models/Application';
import StudentProfile from '../models/StudentProfile';
import Notification from '../models/Notification';
import { calculateMatch } from '../services/matchingService';
import User from '../models/User';
import mongoose from 'mongoose';

export const getOpportunities = async (req: AuthRequest, res: Response) => {
  try {
    const { sport, state, type, status = 'published', page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = { verificationStatus: 'approved', status };
    if (sport) filter.sport = new RegExp(String(sport), 'i');
    if (state) filter.state = new RegExp(String(state), 'i');
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter).populate('organizationId', 'name').sort({ registrationDeadline: 1 }).skip(skip).limit(Number(limit)),
      Opportunity.countDocuments(filter),
    ]);
    res.json({ success: true, data: opportunities, total });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch opportunities' });
  }
};

export const getOpportunityById = async (req: AuthRequest, res: Response) => {
  try {
    const opp = await Opportunity.findById(req.params.id).populate('organizationId', 'name email');
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json({ success: true, data: opp });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch opportunity' });
  }
};

export const createOpportunity = async (req: AuthRequest, res: Response) => {
  try {
    const validationError = validateOpportunityInput(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const opp = await Opportunity.create({ ...req.body, organizationId: req.user?.id, verificationStatus: 'pending', status: 'draft', isDemo: false });
    await Notification.create({ userId: req.user!.id, title: 'Opportunity submitted for verification', message: `${opp.title} is pending admin verification.`, type: 'verification', relatedId: opp._id });
    const admins = await User.find({ role: 'ADMIN', isActive: true }).select('_id');
    if (admins.length) await Notification.insertMany(admins.map(admin => ({ userId: admin._id, title: 'New opportunity pending verification', message: `${opp.title} requires admin review.`, type: 'verification', relatedId: opp._id })));
    res.status(201).json({ success: true, message: 'Opportunity submitted for verification', data: opp });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create opportunity' });
  }
};

export const updateOpportunity = async (req: AuthRequest, res: Response) => {
  try {
    const validationError = validateOpportunityInput(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const opp = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.user?.id },
      { $set: { ...req.body, verificationStatus: 'pending', status: 'draft', isDemo: false } }, { new: true, runValidators: true }
    );
    if (!opp) return res.status(404).json({ success: false, message: 'Not found' });
    await Notification.create({ userId: req.user!.id, title: 'Opportunity updated', message: `${opp.title} was updated and returned to pending verification.`, type: 'verification', relatedId: opp._id });
    res.json({ success: true, data: opp });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

function validateOpportunityInput(input: Record<string, any>): string | null {
  const required = ['title', 'type', 'sport', 'description', 'startDate', 'endDate', 'registrationDeadline', 'location', 'state'];
  if (required.some(field => !input[field])) return 'Title, type, sport, description, dates, location, and state are required';
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const deadline = new Date(input.registrationDeadline);
  if ([start, end, deadline].some(date => Number.isNaN(date.getTime()))) return 'Enter valid opportunity dates';
  if (end < start || deadline > start) return 'End date must follow start date and deadline cannot be after the start date';
  if (!Number.isInteger(Number(input.ageMin)) || !Number.isInteger(Number(input.ageMax)) || Number(input.ageMin) < 0 || Number(input.ageMax) < Number(input.ageMin)) return 'Enter a valid age range';
  if (Number(input.slots || 0) < 0) return 'Slots cannot be negative';
  return null;
}

export const deleteOpportunity = async (req: AuthRequest, res: Response) => {
  try {
    const opp = await Opportunity.findOne({ _id: req.params.id, organizationId: req.user?.id });
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    if (opp.status === 'published') return res.status(400).json({ success: false, message: 'Published opportunities cannot be deleted' });
    await opp.deleteOne();
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const getOrgApplications = async (req: AuthRequest, res: Response) => {
  try {
    const opportunities = await Opportunity.find({ organizationId: req.user?.id }).select('_id title sport');
    const ids = opportunities.map(opportunity => opportunity._id);
    const applications = await Application.find({ opportunityId: { $in: ids } })
      .populate('studentId', 'name email state district')
      .populate('opportunityId', 'title sport registrationDeadline')
      .sort({ submittedAt: -1 });
    res.json({ success: true, data: applications });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

export const getMatchedOpportunities = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user?.id });
    const user = await User.findById(req.user?.id);
    if (!profile || !user) return res.status(404).json({ success: false, message: 'Profile not found' });

    const age = Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const opportunities = await Opportunity.find({ verificationStatus: 'approved', status: 'published' });

    const matched = opportunities.map(opp => {
      const result = calculateMatch({
        studentAge: age, studentSport: profile.sportInterests[0] || '', studentState: user.state,
        studentDistrict: user.district, studentGender: profile.gender, performanceScore: profile.overallScore,
        opportunity: { sport: opp.sport, ageMin: opp.ageMin, ageMax: opp.ageMax, gender: opp.gender, state: opp.state, district: opp.district, registrationDeadline: opp.registrationDeadline, status: opp.status, verificationStatus: opp.verificationStatus },
      });
      return { ...opp.toObject(), matchScore: result.matchScore, matchReasons: result.matchReasons, eligible: result.eligible };
    }).filter(o => o.eligible).sort((a, b) => b.matchScore - a.matchScore);

    const now = Date.now();
    for (const opportunity of matched) {
      const daysToDeadline = Math.ceil((new Date(opportunity.registrationDeadline).getTime() - now) / 86400000);
      const daysToEvent = Math.ceil((new Date(opportunity.startDate).getTime() - now) / 86400000);
      await ensureOpportunityNotification(req.user!.id, opportunity._id, 'New opportunity matched', `${opportunity.title} matches your profile with a ${opportunity.matchScore}% recommendation score.`, 'opportunity');
      if (daysToDeadline >= 0 && daysToDeadline <= 7) {
        await ensureOpportunityNotification(req.user!.id, opportunity._id, 'Registration deadline reminder', `${opportunity.title} registration closes in ${daysToDeadline === 0 ? 'less than a day' : `${daysToDeadline} day${daysToDeadline === 1 ? '' : 's'}`}.`, 'opportunity');
      }
      if (daysToEvent >= 0 && daysToEvent <= 7) {
        await ensureOpportunityNotification(req.user!.id, opportunity._id, 'Upcoming sports event', `${opportunity.title} starts in ${daysToEvent === 0 ? 'less than a day' : `${daysToEvent} day${daysToEvent === 1 ? '' : 's'}`}. Check the event details and prepare your documents.`, 'event');
      }
    }

    res.json({ success: true, data: matched });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to match opportunities' });
  }
};

async function ensureOpportunityNotification(userId: string, opportunityId: mongoose.Types.ObjectId, title: string, message: string, type: 'opportunity' | 'event') {
  const exists = await Notification.exists({ userId, relatedId: opportunityId, title });
  if (!exists) await Notification.create({ userId, relatedId: opportunityId, title, message, type });
}

export const applyToOpportunity = async (req: AuthRequest, res: Response) => {
  try {
    const { opportunityId, documents, notes } = req.body;
    const opp = await Opportunity.findById(opportunityId);
    if (!opp || opp.status !== 'published') return res.status(400).json({ success: false, message: 'Opportunity not available' });
    if (new Date(opp.registrationDeadline) < new Date()) return res.status(400).json({ success: false, message: 'Registration deadline passed' });

    const existing = await Application.findOne({ opportunityId, studentId: req.user?.id });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });

    const application = await Application.create({ opportunityId, studentId: req.user?.id, documents: documents || [], notes: notes || '' });
    await Notification.insertMany([
      {
        userId: req.user?.id,
        title: 'Application submitted',
        message: `Your application for ${opp.title} was submitted successfully.`,
        type: 'application',
        relatedId: application._id,
      },
      {
        userId: opp.organizationId,
        title: 'New opportunity application',
        message: `A student submitted an application for ${opp.title}.`,
        type: 'application',
        relatedId: application._id,
      },
    ]);
    res.status(201).json({ success: true, data: application });
  } catch {
    res.status(500).json({ success: false, message: 'Application failed' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const apps = await Application.find({ studentId: req.user?.id }).populate('opportunityId').sort({ submittedAt: -1 });
    res.json({ success: true, data: apps });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['submitted', 'under_review', 'shortlisted', 'selected', 'rejected', 'completed'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid application status' });
    const current = await Application.findById(req.params.id).populate('opportunityId', 'organizationId title');
    const opportunity = current?.opportunityId as unknown as { organizationId: mongoose.Types.ObjectId; title: string } | undefined;
    if (!current || (req.user?.role === 'GOVERNMENT_ORGANIZATION' && String(opportunity?.organizationId) !== req.user.id)) return res.status(403).json({ success: false, message: 'Not authorized for this application' });
    const app = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    await Notification.create({
      userId: app.studentId, title: 'Application Status Updated',
      message: `Your application status is now: ${req.body.status}`, type: 'application', relatedId: app._id,
    });
    if (opportunity?.organizationId) await Notification.create({ userId: opportunity.organizationId, title: 'Application status updated', message: `Application for ${opportunity.title} changed to ${req.body.status}.`, type: 'application', relatedId: app._id });
    res.json({ success: true, data: app });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

export const getOrgOpportunities = async (req: AuthRequest, res: Response) => {
  try {
    const opps = await Opportunity.find({ organizationId: req.user?.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: opps });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch' });
  }
};
