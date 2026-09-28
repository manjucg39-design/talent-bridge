"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentStats = exports.deleteAchievement = exports.addAchievement = exports.getMyProfile = exports.updateStudentProfile = exports.getStudentById = exports.removeStudentForTeacher = exports.updateStudentForTeacher = exports.createStudentForTeacher = exports.getStudents = void 0;
const User_1 = __importDefault(require("../models/User"));
const StudentProfile_1 = __importDefault(require("../models/StudentProfile"));
const FitnessTest_1 = __importDefault(require("../models/FitnessTest"));
const AIAssessment_1 = __importDefault(require("../models/AIAssessment"));
const PerformanceRecord_1 = __importDefault(require("../models/PerformanceRecord"));
const Achievement_1 = __importDefault(require("../models/Achievement"));
const Notification_1 = __importDefault(require("../models/Notification"));
const getStudents = async (req, res) => {
    try {
        const { sport, state, district, potentialFlag, improvementFlag, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const userFilter = { role: 'STUDENT', isActive: true };
        if (state)
            userFilter.state = state;
        if (district)
            userFilter.district = district;
        const profileFilter = {};
        if (sport)
            profileFilter.sportInterests = sport;
        if (potentialFlag === 'true')
            profileFilter.potentialFlag = true;
        if (improvementFlag === 'true')
            profileFilter.improvementFlag = true;
        const profiles = await StudentProfile_1.default.find(profileFilter)
            .populate({ path: 'userId', match: userFilter, select: '-passwordHash' })
            .skip(skip).limit(Number(limit));
        const filtered = profiles.filter(p => p.userId);
        res.json({ success: true, data: filtered, total: filtered.length });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
};
exports.getStudents = getStudents;
const createStudentForTeacher = async (req, res) => {
    try {
        const { name, email, phone, password, dateOfBirth, gender, school, district, state, sportInterests, parentConsent } = req.body;
        if (!name || !email || !phone || !password || !dateOfBirth || !gender || !school || !district || !state) {
            return res.status(400).json({ success: false, message: 'Name, contact, DOB, school, location, gender, and password are required' });
        }
        if (!parentConsent)
            return res.status(400).json({ success: false, message: 'Parent/guardian consent is required' });
        const birthDate = new Date(dateOfBirth);
        if (Number.isNaN(birthDate.getTime()) || birthDate >= new Date())
            return res.status(400).json({ success: false, message: 'Enter a valid date of birth' });
        if (password.length < 8)
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        if (await User_1.default.findOne({ email: String(email).toLowerCase() }))
            return res.status(409).json({ success: false, message: 'Email already registered' });
        const user = await User_1.default.create({
            name, email, phone, passwordHash: password, role: 'STUDENT', state, district,
            isVerified: false, verificationStatus: 'PENDING',
        });
        const profile = await StudentProfile_1.default.create({
            userId: user._id, teacherId: req.user?.id, dateOfBirth: birthDate, gender, school,
            sportInterests: Array.isArray(sportInterests) ? sportInterests : [], parentConsent,
        });
        await Notification_1.default.create({
            userId: user._id,
            title: 'Student profile created',
            message: 'Your PE teacher created your athlete profile. Complete verification before participating in official opportunities.',
            type: 'general',
        });
        await Notification_1.default.create({
            userId: req.user.id,
            title: 'Student added successfully',
            message: `${user.name} was added to your assigned student list.`,
            type: 'profile',
            relatedId: user._id,
        });
        res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email }, profile } });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add student';
        res.status(500).json({ success: false, message });
    }
};
exports.createStudentForTeacher = createStudentForTeacher;
const teacherOwnsStudent = async (studentId, teacherId) => {
    if (!teacherId)
        return false;
    const profile = await StudentProfile_1.default.findOne({ userId: studentId, teacherId });
    if (profile)
        return true;
    return (await FitnessTest_1.default.exists({ studentId, teacherId })) !== null;
};
const updateStudentForTeacher = async (req, res) => {
    try {
        if (!(await teacherOwnsStudent(req.params.id, req.user?.id)))
            return res.status(403).json({ success: false, message: 'You can only edit your assigned students' });
        const { name, email, phone, dateOfBirth, gender, school, district, state, sportInterests, parentConsent } = req.body;
        const user = await User_1.default.findOne({ _id: req.params.id, role: 'STUDENT', isActive: true });
        const profile = await StudentProfile_1.default.findOne({ userId: req.params.id });
        if (!user || !profile)
            return res.status(404).json({ success: false, message: 'Student not found' });
        if (email && email.toLowerCase() !== user.email) {
            const duplicate = await User_1.default.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
            if (duplicate)
                return res.status(409).json({ success: false, message: 'Email already registered' });
        }
        if (dateOfBirth && (Number.isNaN(new Date(dateOfBirth).getTime()) || new Date(dateOfBirth) >= new Date()))
            return res.status(400).json({ success: false, message: 'Enter a valid date of birth' });
        if (parentConsent === false)
            return res.status(400).json({ success: false, message: 'Parent/guardian consent is required' });
        Object.assign(user, { name, email: email?.toLowerCase(), phone, state, district });
        await user.save();
        Object.assign(profile, { dateOfBirth, gender, school, sportInterests, parentConsent });
        await profile.save();
        await Notification_1.default.create({ userId: user._id, title: 'Athlete profile updated', message: 'Your PE teacher updated your athlete profile details.', type: 'profile', relatedId: profile._id });
        res.json({ success: true, data: { user: user.toObject(), profile } });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update student';
        res.status(500).json({ success: false, message });
    }
};
exports.updateStudentForTeacher = updateStudentForTeacher;
const removeStudentForTeacher = async (req, res) => {
    try {
        if (!(await teacherOwnsStudent(req.params.id, req.user?.id)))
            return res.status(403).json({ success: false, message: 'You can only remove your assigned students' });
        const user = await User_1.default.findOneAndUpdate({ _id: req.params.id, role: 'STUDENT' }, { isActive: false, verificationStatus: 'SUSPENDED' }, { new: true }).select('-passwordHash');
        if (!user)
            return res.status(404).json({ success: false, message: 'Student not found' });
        await Notification_1.default.create({ userId: user._id, title: 'Student access updated', message: 'Your athlete profile is no longer active with this teacher.', type: 'verification', relatedId: user._id });
        res.json({ success: true, message: 'Student removed from your active list' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to remove student' });
    }
};
exports.removeStudentForTeacher = removeStudentForTeacher;
const getStudentById = async (req, res) => {
    try {
        const profile = await StudentProfile_1.default.findOne({ userId: req.params.id })
            .populate('userId', '-passwordHash');
        if (!profile)
            return res.status(404).json({ success: false, message: 'Student not found' });
        const tests = await FitnessTest_1.default.find({ studentId: req.params.id }).sort({ testDate: -1 }).limit(10);
        const assessments = await AIAssessment_1.default.find({ studentId: req.params.id }).sort({ createdAt: -1 }).limit(5);
        const performance = await PerformanceRecord_1.default.find({ studentId: req.params.id }).sort({ date: -1 }).limit(20);
        const achievements = await Achievement_1.default.find({ studentId: req.params.id }).sort({ date: -1 });
        res.json({ success: true, data: { profile, tests, assessments, performance, achievements } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch student' });
    }
};
exports.getStudentById = getStudentById;
const updateStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile_1.default.findOneAndUpdate({ userId: req.user?.id }, { $set: req.body }, { new: true });
        res.json({ success: true, data: profile });
    }
    catch {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
};
exports.updateStudentProfile = updateStudentProfile;
const getMyProfile = async (req, res) => {
    try {
        const profile = await StudentProfile_1.default.findOne({ userId: req.user?.id }).populate('userId', '-passwordHash');
        if (!profile)
            return res.status(404).json({ success: false, message: 'Profile not found' });
        const tests = await FitnessTest_1.default.find({ studentId: req.user?.id }).sort({ testDate: -1 });
        const assessments = await AIAssessment_1.default.find({ studentId: req.user?.id }).sort({ createdAt: -1 });
        const performance = await PerformanceRecord_1.default.find({ studentId: req.user?.id }).sort({ date: -1 });
        const achievements = await Achievement_1.default.find({ studentId: req.user?.id }).sort({ date: -1 });
        res.json({ success: true, data: { profile, tests, assessments, performance, achievements } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};
exports.getMyProfile = getMyProfile;
const addAchievement = async (req, res) => {
    try {
        const achievement = await Achievement_1.default.create({ ...req.body, studentId: req.user?.id });
        res.status(201).json({ success: true, data: achievement });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to add achievement' });
    }
};
exports.addAchievement = addAchievement;
const deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement_1.default.findOne({ _id: req.params.id, studentId: req.user?.id });
        if (!achievement)
            return res.status(404).json({ success: false, message: 'Achievement not found or not authorized' });
        await achievement.deleteOne();
        res.json({ success: true, message: 'Achievement deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete achievement' });
    }
};
exports.deleteAchievement = deleteAchievement;
const getStudentStats = async (req, res) => {
    try {
        const studentId = req.params.id || req.user?.id;
        const totalTests = await FitnessTest_1.default.countDocuments({ studentId });
        const latestAssessment = await AIAssessment_1.default.findOne({ studentId }).sort({ createdAt: -1 });
        const profile = await StudentProfile_1.default.findOne({ userId: studentId });
        const user = await User_1.default.findById(studentId).select('-passwordHash');
        res.json({ success: true, data: { totalTests, latestAssessment, profile, user } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};
exports.getStudentStats = getStudentStats;
