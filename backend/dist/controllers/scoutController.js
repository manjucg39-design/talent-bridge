"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoutStats = exports.getShortlist = exports.deleteShortlist = exports.updateShortlist = exports.shortlistAthlete = exports.getAthleteDetail = exports.getAthletes = void 0;
const ScoutShortlist_1 = __importDefault(require("../models/ScoutShortlist"));
const StudentProfile_1 = __importDefault(require("../models/StudentProfile"));
const User_1 = __importDefault(require("../models/User"));
const AIAssessment_1 = __importDefault(require("../models/AIAssessment"));
const FitnessTest_1 = __importDefault(require("../models/FitnessTest"));
const Achievement_1 = __importDefault(require("../models/Achievement"));
const Notification_1 = __importDefault(require("../models/Notification"));
const getAthletes = async (req, res) => {
    try {
        const { sport, state, district, potentialFlag, improvementFlag, minScore, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const userFilter = { role: 'STUDENT', isActive: true };
        if (state)
            userFilter.state = new RegExp(String(state), 'i');
        if (district)
            userFilter.district = new RegExp(String(district), 'i');
        const profileFilter = {};
        if (sport)
            profileFilter.sportInterests = new RegExp(String(sport), 'i');
        if (potentialFlag === 'true')
            profileFilter.potentialFlag = true;
        if (improvementFlag === 'true')
            profileFilter.improvementFlag = true;
        if (minScore)
            profileFilter.overallScore = { $gte: Number(minScore) };
        const profiles = await StudentProfile_1.default.find(profileFilter)
            .populate({ path: 'userId', match: userFilter, select: '-passwordHash' })
            .skip(skip).limit(Number(limit));
        const filtered = profiles.filter(p => p.userId);
        res.json({ success: true, data: filtered, total: filtered.length });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch athletes' });
    }
};
exports.getAthletes = getAthletes;
const getAthleteDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await StudentProfile_1.default.findOne({ userId: id }).populate('userId', '-passwordHash');
        if (!profile)
            return res.status(404).json({ success: false, message: 'Athlete not found' });
        const tests = await FitnessTest_1.default.find({ studentId: id }).sort({ testDate: -1 }).limit(10);
        const assessments = await AIAssessment_1.default.find({ studentId: id }).sort({ createdAt: -1 }).limit(3);
        const achievements = await Achievement_1.default.find({ studentId: id });
        const shortlisted = await ScoutShortlist_1.default.findOne({ scoutId: req.user?.id, studentId: id });
        res.json({ success: true, data: { profile, tests, assessments, achievements, isShortlisted: !!shortlisted } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch athlete' });
    }
};
exports.getAthleteDetail = getAthleteDetail;
const shortlistAthlete = async (req, res) => {
    try {
        const { studentId, notes, status = 'shortlisted' } = req.body;
        const student = await User_1.default.findOne({ _id: studentId, role: 'STUDENT', isActive: true });
        if (!student)
            return res.status(404).json({ success: false, message: 'Athlete not found' });
        if (!['shortlisted', 'evaluation_requested', 'referred'].includes(status))
            return res.status(400).json({ success: false, message: 'Invalid scout action' });
        const existing = await ScoutShortlist_1.default.findOne({ scoutId: req.user?.id, studentId });
        const entry = await ScoutShortlist_1.default.findOneAndUpdate({ scoutId: req.user?.id, studentId }, { status, ...(notes !== undefined ? { notes } : {}) }, { upsert: true, new: true });
        if (!existing || existing.status !== status) {
            const messages = {
                shortlisted: 'A scout has shortlisted your profile for further evaluation.',
                evaluation_requested: 'A scout requested further evaluation of your profile.',
                referred: 'A scout recommended your profile for training consideration.',
            };
            await Notification_1.default.create({ userId: studentId, title: 'Scout profile update', message: messages[status], type: 'scout', relatedId: entry._id });
        }
        res.json({ success: true, data: entry });
    }
    catch {
        res.status(500).json({ success: false, message: 'Shortlist failed' });
    }
};
exports.shortlistAthlete = shortlistAthlete;
const updateShortlist = async (req, res) => {
    try {
        const entry = await ScoutShortlist_1.default.findOneAndUpdate({ _id: req.params.id, scoutId: req.user?.id }, { $set: { notes: req.body.notes || '', ...(req.body.status ? { status: req.body.status } : {}) } }, { new: true, runValidators: true });
        if (!entry)
            return res.status(404).json({ success: false, message: 'Shortlist entry not found' });
        res.json({ success: true, data: entry });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update shortlist' });
    }
};
exports.updateShortlist = updateShortlist;
const deleteShortlist = async (req, res) => {
    try {
        const entry = await ScoutShortlist_1.default.findOneAndDelete({ _id: req.params.id, scoutId: req.user?.id });
        if (!entry)
            return res.status(404).json({ success: false, message: 'Shortlist entry not found' });
        res.json({ success: true, message: 'Athlete removed from shortlist' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to remove shortlist entry' });
    }
};
exports.deleteShortlist = deleteShortlist;
const getShortlist = async (req, res) => {
    try {
        const list = await ScoutShortlist_1.default.find({ scoutId: req.user?.id }).sort({ createdAt: -1 }).lean();
        const studentIds = list.map(item => item.studentId);
        const profiles = await StudentProfile_1.default.find({ userId: { $in: studentIds } }).populate('userId', '-passwordHash').lean();
        const profileByStudent = new Map(profiles.map(profile => [String(profile.userId?._id || profile.userId), profile]));
        const connected = list.map(item => ({ ...item, studentId: profileByStudent.get(String(item.studentId)) || item.studentId }));
        res.json({ success: true, data: connected });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch shortlist' });
    }
};
exports.getShortlist = getShortlist;
const getScoutStats = async (req, res) => {
    try {
        const totalAthletes = await User_1.default.countDocuments({ role: 'STUDENT', isActive: true });
        const flagged = await StudentProfile_1.default.countDocuments({ potentialFlag: true });
        const improving = await StudentProfile_1.default.countDocuments({ improvementFlag: true });
        const shortlisted = await ScoutShortlist_1.default.countDocuments({ scoutId: req.user?.id });
        res.json({ success: true, data: { totalAthletes, flagged, improving, shortlisted } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};
exports.getScoutStats = getScoutStats;
