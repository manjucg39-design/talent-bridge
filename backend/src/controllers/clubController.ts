import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Club from '../models/Club';
import KIC from '../models/KIC';
import TrainingRecord from '../models/TrainingRecord';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import Notification from '../models/Notification';

export const getClubs = async (req: AuthRequest, res: Response) => {
  try {
    const { sport, state, district } = req.query;
    const filter: Record<string, unknown> = {};
    if (sport) filter.sports = new RegExp(String(sport), 'i');
    if (state) filter.state = new RegExp(String(state), 'i');
    if (district) filter.district = new RegExp(String(district), 'i');
    const clubs = await Club.find(filter).sort({ verificationStatus: 1 });
    res.json({ success: true, data: clubs });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
  }
};

export const getClubById = async (req: AuthRequest, res: Response) => {
  try {
    const club = await Club.findById(req.params.id).populate('ownerId', 'name email');
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });
    res.json({ success: true, data: club });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch club' });
  }
};

export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    const club = await Club.create({ ...req.body, ownerId: req.user?.id, verificationStatus: 'pending' });
    const admins = await User.find({ role: 'ADMIN', isActive: true }).select('_id');
    if (admins.length) await Notification.insertMany(admins.map(admin => ({ userId: admin._id, title: 'New club verification request', message: `${club.name} is awaiting verification.`, type: 'verification', relatedId: club._id })));
    await Notification.create({ userId: req.user!.id, title: 'Club verification pending', message: `${club.name} was submitted for administrator review.`, type: 'verification', relatedId: club._id });
    res.status(201).json({ success: true, data: club });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create club' });
  }
};

export const getClubDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const club = await Club.findOne({ ownerId: req.user?.id });
    if (!club) return res.status(404).json({ success: false, message: 'Club profile not found' });

    const records = await TrainingRecord.find({ clubId: club._id })
      .populate('studentId', 'name state district')
      .sort({ date: -1 })
      .limit(20);
    const athleteIds = await TrainingRecord.distinct('studentId', { clubId: club._id });
    const requests = await StudentProfile.find({ sportInterests: { $in: club.sports } })
      .populate('userId', 'name state district')
      .sort({ overallScore: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        club,
        stats: {
          activeAthletes: athleteIds.length,
          newRequests: requests.length,
          trainingSessions: await TrainingRecord.countDocuments({ clubId: club._id }),
          upcomingCompetitions: 0,
        },
        requests,
        trainingRecords: records,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch club dashboard' });
  }
};

export const createTrainingRecord = async (req: AuthRequest, res: Response) => {
  try {
    const club = await Club.findOne({ ownerId: req.user?.id });
    if (!club) return res.status(404).json({ success: false, message: 'Club profile not found' });
    const { studentId, activity, performance, coachNotes, date } = req.body;
    if (!studentId || !activity) return res.status(400).json({ success: false, message: 'Student and activity are required' });
    const student = await User.findOne({ _id: studentId, role: 'STUDENT', isActive: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const record = await TrainingRecord.create({ studentId, clubId: club._id, activity, performance: performance || '', coachNotes: coachNotes || '', date: date || new Date() });
    await Notification.create({
      userId: studentId,
      title: 'Training progress updated',
      message: `${club.name} recorded a new training update for your profile.`,
      type: 'training',
      relatedId: record._id,
    });
    res.status(201).json({ success: true, data: record });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create training record' });
  }
};

export const getKICs = async (req: AuthRequest, res: Response) => {
  try {
    const { sport, state, district } = req.query;
    const filter: Record<string, unknown> = {};
    if (sport) filter.sports = new RegExp(String(sport), 'i');
    if (state) filter.state = new RegExp(String(state), 'i');
    if (district) filter.district = new RegExp(String(district), 'i');
    const kics = await KIC.find(filter);
    res.json({ success: true, data: kics });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch KICs' });
  }
};
