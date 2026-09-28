"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKICs = exports.createTrainingRecord = exports.getClubDashboard = exports.createClub = exports.getClubById = exports.getClubs = void 0;
const Club_1 = __importDefault(require("../models/Club"));
const KIC_1 = __importDefault(require("../models/KIC"));
const TrainingRecord_1 = __importDefault(require("../models/TrainingRecord"));
const User_1 = __importDefault(require("../models/User"));
const StudentProfile_1 = __importDefault(require("../models/StudentProfile"));
const Notification_1 = __importDefault(require("../models/Notification"));
const getClubs = async (req, res) => {
    try {
        const { sport, state, district } = req.query;
        const filter = {};
        if (sport)
            filter.sports = new RegExp(String(sport), 'i');
        if (state)
            filter.state = new RegExp(String(state), 'i');
        if (district)
            filter.district = new RegExp(String(district), 'i');
        const clubs = await Club_1.default.find(filter).sort({ verificationStatus: 1 });
        res.json({ success: true, data: clubs });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch clubs' });
    }
};
exports.getClubs = getClubs;
const getClubById = async (req, res) => {
    try {
        const club = await Club_1.default.findById(req.params.id).populate('ownerId', 'name email');
        if (!club)
            return res.status(404).json({ success: false, message: 'Club not found' });
        res.json({ success: true, data: club });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch club' });
    }
};
exports.getClubById = getClubById;
const createClub = async (req, res) => {
    try {
        const club = await Club_1.default.create({ ...req.body, ownerId: req.user?.id, verificationStatus: 'pending' });
        const admins = await User_1.default.find({ role: 'ADMIN', isActive: true }).select('_id');
        if (admins.length)
            await Notification_1.default.insertMany(admins.map(admin => ({ userId: admin._id, title: 'New club verification request', message: `${club.name} is awaiting verification.`, type: 'verification', relatedId: club._id })));
        await Notification_1.default.create({ userId: req.user.id, title: 'Club verification pending', message: `${club.name} was submitted for administrator review.`, type: 'verification', relatedId: club._id });
        res.status(201).json({ success: true, data: club });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create club' });
    }
};
exports.createClub = createClub;
const getClubDashboard = async (req, res) => {
    try {
        const club = await Club_1.default.findOne({ ownerId: req.user?.id });
        if (!club)
            return res.status(404).json({ success: false, message: 'Club profile not found' });
        const records = await TrainingRecord_1.default.find({ clubId: club._id })
            .populate('studentId', 'name state district')
            .sort({ date: -1 })
            .limit(20);
        const athleteIds = await TrainingRecord_1.default.distinct('studentId', { clubId: club._id });
        const requests = await StudentProfile_1.default.find({ sportInterests: { $in: club.sports } })
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
                    trainingSessions: await TrainingRecord_1.default.countDocuments({ clubId: club._id }),
                    upcomingCompetitions: 0,
                },
                requests,
                trainingRecords: records,
            },
        });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch club dashboard' });
    }
};
exports.getClubDashboard = getClubDashboard;
const createTrainingRecord = async (req, res) => {
    try {
        const club = await Club_1.default.findOne({ ownerId: req.user?.id });
        if (!club)
            return res.status(404).json({ success: false, message: 'Club profile not found' });
        const { studentId, activity, performance, coachNotes, date } = req.body;
        if (!studentId || !activity)
            return res.status(400).json({ success: false, message: 'Student and activity are required' });
        const student = await User_1.default.findOne({ _id: studentId, role: 'STUDENT', isActive: true });
        if (!student)
            return res.status(404).json({ success: false, message: 'Student not found' });
        const record = await TrainingRecord_1.default.create({ studentId, clubId: club._id, activity, performance: performance || '', coachNotes: coachNotes || '', date: date || new Date() });
        await Notification_1.default.create({
            userId: studentId,
            title: 'Training progress updated',
            message: `${club.name} recorded a new training update for your profile.`,
            type: 'training',
            relatedId: record._id,
        });
        res.status(201).json({ success: true, data: record });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to create training record' });
    }
};
exports.createTrainingRecord = createTrainingRecord;
const getKICs = async (req, res) => {
    try {
        const { sport, state, district } = req.query;
        const filter = {};
        if (sport)
            filter.sports = new RegExp(String(sport), 'i');
        if (state)
            filter.state = new RegExp(String(state), 'i');
        if (district)
            filter.district = new RegExp(String(district), 'i');
        const kics = await KIC_1.default.find(filter);
        res.json({ success: true, data: kics });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch KICs' });
    }
};
exports.getKICs = getKICs;
