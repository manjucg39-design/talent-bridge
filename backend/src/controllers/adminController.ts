import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import Opportunity from '../models/Opportunity';
import Club from '../models/Club';
import FitnessTest from '../models/FitnessTest';
import AIAssessment from '../models/AIAssessment';
import Application from '../models/Application';
import Notification from '../models/Notification';

export const getStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [students, teachers, clubs, scouts, orgs, opportunities, applications, flagged, improving] = await Promise.all([
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      User.countDocuments({ role: 'PE_TEACHER', isActive: true }),
      Club.countDocuments(),
      User.countDocuments({ role: 'SCOUT', isActive: true }),
      User.countDocuments({ role: 'GOVERNMENT_ORGANIZATION', isActive: true }),
      Opportunity.countDocuments(),
      Application.countDocuments(),
      StudentProfile.countDocuments({ potentialFlag: true }),
      StudentProfile.countDocuments({ improvementFlag: true }),
    ]);
    res.json({ success: true, data: { students, teachers, clubs, scouts, orgs, opportunities, applications, flagged, improving } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

export const getPendingVerifications = async (_req: AuthRequest, res: Response) => {
  try {
    const [pendingOrgs, pendingTeachers, pendingScouts, pendingClubs, pendingOpps] = await Promise.all([
      User.find({ role: 'GOVERNMENT_ORGANIZATION', verificationStatus: 'PENDING' }).select('-passwordHash'),
      User.find({ role: 'PE_TEACHER', verificationStatus: 'PENDING' }).select('-passwordHash'),
      User.find({ role: 'SCOUT', verificationStatus: 'PENDING' }).select('-passwordHash'),
      Club.find({ verificationStatus: 'pending' }),
      Opportunity.find({ verificationStatus: 'pending' }).populate('organizationId', 'name'),
    ]);
    res.json({ success: true, data: { organizations: pendingOrgs, teachers: pendingTeachers, scouts: pendingScouts, clubs: pendingClubs, opportunities: pendingOpps } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch pending verifications' });
  }
};

export const verifyEntity = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const { id } = req.params;

    if (type === 'user' || type === 'teacher' || type === 'scout' || type === 'organization') {
      const user = await User.findByIdAndUpdate(id, {
        isVerified: true,
        verificationStatus: 'VERIFIED',
        verifiedBy: req.user?.id,
        verifiedAt: new Date(),
      }, { new: true });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      await Notification.create({ userId: user._id, title: 'Verification approved', message: 'Your account verification was approved by an administrator.', type: 'verification', relatedId: user._id });
    } else if (type === 'club') {
      const club = await Club.findByIdAndUpdate(id, { verificationStatus: 'verified' });
      if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
      await Notification.create({ userId: club.ownerId, title: 'Club verification approved', message: `${club.name} is now verified.`, type: 'verification', relatedId: club._id });
    } else if (type === 'opportunity') {
      const opp = await Opportunity.findByIdAndUpdate(id, { verificationStatus: 'approved', status: 'published' }, { new: true });
      if (opp) {
        const students = await User.find({ role: 'STUDENT' }).select('_id');
        const notifications = students.map(s => ({
          userId: s._id, title: 'New Opportunity Available',
          message: `${opp.title} is now open for applications.`, type: 'opportunity', relatedId: opp._id,
        }));
        await Notification.insertMany(notifications);
      } else return res.status(404).json({ success: false, message: 'Opportunity not found' });
      await Notification.create({ userId: opp.organizationId, title: 'Opportunity approved', message: `${opp.title} is now published and open for applications.`, type: 'opportunity', relatedId: opp._id });
    } else return res.status(400).json({ success: false, message: 'Invalid verification type' });
    res.json({ success: true, message: 'Verified successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

export const rejectEntity = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const { id } = req.params;
    const { notes } = req.body;
    if (type === 'opportunity') {
      const opportunity = await Opportunity.findByIdAndUpdate(id, { verificationStatus: 'rejected', status: 'draft' });
      if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
      await Notification.create({ userId: opportunity.organizationId, title: 'Opportunity needs changes', message: `${opportunity.title} was rejected. Review the admin feedback and resubmit it.`, type: 'verification', relatedId: opportunity._id });
    } else if (type === 'club') {
      const club = await Club.findByIdAndUpdate(id, { verificationStatus: 'rejected' });
      if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
      await Notification.create({ userId: club.ownerId, title: 'Club verification rejected', message: `${club.name} was not approved for verification.`, type: 'verification', relatedId: club._id });
    } else if (type === 'user' || type === 'teacher' || type === 'scout' || type === 'organization') {
      const user = await User.findByIdAndUpdate(id, { verificationStatus: 'REJECTED', verificationNotes: notes || '' });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      await Notification.create({ userId: user._id, title: 'Verification rejected', message: notes || 'Your account verification was rejected by an administrator.', type: 'verification', relatedId: user._id });
    } else return res.status(400).json({ success: false, message: 'Invalid verification type' });
    res.json({ success: true, message: 'Rejected' });
  } catch {
    res.status(500).json({ success: false, message: 'Rejection failed' });
  }
};

export const setUserActive = async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user?.id) return res.status(400).json({ success: false, message: 'You cannot suspend your own admin account' });
    const active = req.body.active === true;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: active, ...(active ? {} : { verificationStatus: 'SUSPENDED' }) }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await Notification.create({ userId: user._id, title: active ? 'Account reactivated' : 'Account suspended', message: active ? 'An administrator reactivated your account.' : 'An administrator suspended your account.', type: 'verification', relatedId: user._id });
    res.json({ success: true, data: user, message: active ? 'User reactivated' : 'User suspended' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};
