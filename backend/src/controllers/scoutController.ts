import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ScoutShortlist from '../models/ScoutShortlist';
import StudentProfile from '../models/StudentProfile';
import User from '../models/User';
import AIAssessment from '../models/AIAssessment';
import FitnessTest from '../models/FitnessTest';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';

export const getAthletes = async (req: AuthRequest, res: Response) => {
  try {
    const { sport, state, district, potentialFlag, improvementFlag, minScore, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const userFilter: Record<string, unknown> = { role: 'STUDENT', isActive: true };
    if (state) userFilter.state = new RegExp(String(state), 'i');
    if (district) userFilter.district = new RegExp(String(district), 'i');

    const profileFilter: Record<string, unknown> = {};
    if (sport) profileFilter.sportInterests = new RegExp(String(sport), 'i');
    if (potentialFlag === 'true') profileFilter.potentialFlag = true;
    if (improvementFlag === 'true') profileFilter.improvementFlag = true;
    if (minScore) profileFilter.overallScore = { $gte: Number(minScore) };

    const profiles = await StudentProfile.find(profileFilter)
      .populate({ path: 'userId', match: userFilter, select: '-passwordHash' })
      .skip(skip).limit(Number(limit));

    const filtered = profiles.filter(p => p.userId);
    res.json({ success: true, data: filtered, total: filtered.length });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch athletes' });
  }
};

export const getAthleteDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await StudentProfile.findOne({ userId: id }).populate('userId', '-passwordHash');
    if (!profile) return res.status(404).json({ success: false, message: 'Athlete not found' });
    const tests = await FitnessTest.find({ studentId: id }).sort({ testDate: -1 }).limit(10);
    const assessments = await AIAssessment.find({ studentId: id }).sort({ createdAt: -1 }).limit(3);
    const achievements = await Achievement.find({ studentId: id });
    const shortlisted = await ScoutShortlist.findOne({ scoutId: req.user?.id, studentId: id });
    res.json({ success: true, data: { profile, tests, assessments, achievements, isShortlisted: !!shortlisted } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch athlete' });
  }
};

export const shortlistAthlete = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, notes, status = 'shortlisted' } = req.body;
    const student = await User.findOne({ _id: studentId, role: 'STUDENT', isActive: true });
    if (!student) return res.status(404).json({ success: false, message: 'Athlete not found' });
    if (!['shortlisted', 'evaluation_requested', 'referred'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid scout action' });
    const existing = await ScoutShortlist.findOne({ scoutId: req.user?.id, studentId });
    const entry = await ScoutShortlist.findOneAndUpdate(
      { scoutId: req.user?.id, studentId },
      { status, ...(notes !== undefined ? { notes } : {}) },
      { upsert: true, new: true }
    );
    if (!existing || existing.status !== status) {
      const messages: Record<string, string> = {
        shortlisted: 'A scout has shortlisted your profile for further evaluation.',
        evaluation_requested: 'A scout requested further evaluation of your profile.',
        referred: 'A scout recommended your profile for training consideration.',
      };
      await Notification.create({ userId: studentId, title: 'Scout profile update', message: messages[status], type: 'scout', relatedId: entry._id });
    }
    res.json({ success: true, data: entry });
  } catch {
    res.status(500).json({ success: false, message: 'Shortlist failed' });
  }
};

export const updateShortlist = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await ScoutShortlist.findOneAndUpdate(
      { _id: req.params.id, scoutId: req.user?.id },
      { $set: { notes: req.body.notes || '', ...(req.body.status ? { status: req.body.status } : {}) } },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Shortlist entry not found' });
    res.json({ success: true, data: entry });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update shortlist' });
  }
};

export const deleteShortlist = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await ScoutShortlist.findOneAndDelete({ _id: req.params.id, scoutId: req.user?.id });
    if (!entry) return res.status(404).json({ success: false, message: 'Shortlist entry not found' });
    res.json({ success: true, message: 'Athlete removed from shortlist' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to remove shortlist entry' });
  }
};

export const getShortlist = async (req: AuthRequest, res: Response) => {
  try {
    const list = await ScoutShortlist.find({ scoutId: req.user?.id }).sort({ createdAt: -1 }).lean();
    const studentIds = list.map(item => item.studentId);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } }).populate('userId', '-passwordHash').lean();
    const profileByStudent = new Map(profiles.map(profile => [String(profile.userId?._id || profile.userId), profile]));
    const connected = list.map(item => ({ ...item, studentId: profileByStudent.get(String(item.studentId)) || item.studentId }));
    res.json({ success: true, data: connected });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch shortlist' });
  }
};

export const getScoutStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalAthletes = await User.countDocuments({ role: 'STUDENT', isActive: true });
    const flagged = await StudentProfile.countDocuments({ potentialFlag: true });
    const improving = await StudentProfile.countDocuments({ improvementFlag: true });
    const shortlisted = await ScoutShortlist.countDocuments({ scoutId: req.user?.id });
    res.json({ success: true, data: { totalAthletes, flagged, improving, shortlisted } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
