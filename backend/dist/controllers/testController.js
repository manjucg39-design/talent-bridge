"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherStats = exports.getMyStudents = exports.getTestsByStudent = exports.deleteTest = exports.updateTest = exports.createTest = void 0;
const FitnessTest_1 = __importDefault(require("../models/FitnessTest"));
const AIAssessment_1 = __importDefault(require("../models/AIAssessment"));
const StudentProfile_1 = __importDefault(require("../models/StudentProfile"));
const PerformanceRecord_1 = __importDefault(require("../models/PerformanceRecord"));
const Notification_1 = __importDefault(require("../models/Notification"));
const assessmentService_1 = require("../services/assessmentService");
const User_1 = __importDefault(require("../models/User"));
const calcAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};
const getMeasurementUnit = (metric, testType) => {
    if (testType === 'strength')
        return 'reps';
    if (testType === 'jump')
        return 'meters';
    return 'seconds';
};
const createTest = async (req, res) => {
    try {
        const { studentId, testType, sport, measurements, testDate, notes, videoId } = req.body;
        const student = await User_1.default.findOne({ _id: studentId, role: 'STUDENT', isActive: true });
        const profile = await StudentProfile_1.default.findOne({ userId: studentId });
        const teacherOwnsStudent = profile?.teacherId?.toString() === req.user?.id || Boolean(await FitnessTest_1.default.exists({ studentId, teacherId: req.user?.id }));
        const hasValidMeasurements = measurements && Object.values(measurements).some(value => typeof value === 'number' && Number.isFinite(value) && value > 0);
        if (!student || !profile || !teacherOwnsStudent)
            return res.status(403).json({ success: false, message: 'Select a student registered with you' });
        if (!hasValidMeasurements)
            return res.status(400).json({ success: false, message: 'Enter at least one positive measurement' });
        if (testDate && new Date(testDate) > new Date())
            return res.status(400).json({ success: false, message: 'Test date cannot be in the future' });
        const test = await FitnessTest_1.default.create({
            studentId, teacherId: req.user?.id, testType, sport,
            measurements, testDate: testDate || new Date(), notes: notes || '', videoId,
        });
        // Auto-run AI assessment
        const age = calcAge(profile.dateOfBirth);
        const prevAssessment = await AIAssessment_1.default.findOne({ studentId }).sort({ createdAt: -1 });
        const result = (0, assessmentService_1.runAssessment)({
            studentId, testId: String(test._id), testType, measurements, age, sport,
            previousScore: prevAssessment?.performanceScore,
        });
        const assessment = await AIAssessment_1.default.create({ studentId, testId: test._id, ...result });
        // Update student flags
        await StudentProfile_1.default.findOneAndUpdate({ userId: studentId }, {
            potentialFlag: result.potentialFlag,
            improvementFlag: result.improvementFlag,
            overallScore: result.performanceScore,
        });
        // Save performance record
        for (const [metric, value] of Object.entries(measurements)) {
            if (typeof value === 'number') {
                await PerformanceRecord_1.default.create({ testId: test._id, studentId, sport, metric, value, unit: getMeasurementUnit(metric, testType), date: testDate || new Date(), source: 'fitness_test' });
            }
        }
        // Notify student
        await Notification_1.default.create({
            userId: studentId,
            title: 'New Fitness Assessment Ready',
            message: `Your ${testType} test has been assessed. Score: ${result.performanceScore}`,
            type: 'assessment',
            relatedId: assessment._id,
        });
        await Notification_1.default.create({ userId: req.user.id, title: 'Fitness assessment saved', message: `Assessment completed for ${student.name}. Score: ${result.performanceScore}.`, type: 'assessment', relatedId: test._id });
        res.status(201).json({ success: true, data: { test, assessment } });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create test';
        res.status(500).json({ success: false, message });
    }
};
exports.createTest = createTest;
const teacherOwnsTest = async (testId, teacherId) => {
    if (!teacherId)
        return null;
    return FitnessTest_1.default.findOne({ _id: testId, teacherId });
};
const updateTest = async (req, res) => {
    try {
        const test = await teacherOwnsTest(req.params.id, req.user?.id);
        if (!test)
            return res.status(404).json({ success: false, message: 'Fitness test not found' });
        const { testType, sport, measurements, testDate, notes } = req.body;
        const hasValidMeasurements = measurements && Object.values(measurements).some(value => typeof value === 'number' && Number.isFinite(value) && value > 0);
        if (!testType || !sport || !hasValidMeasurements)
            return res.status(400).json({ success: false, message: 'Test type, sport, and a positive measurement are required' });
        if (testDate && new Date(testDate) > new Date())
            return res.status(400).json({ success: false, message: 'Test date cannot be in the future' });
        Object.assign(test, { testType, sport, measurements, testDate: testDate || test.testDate, notes: notes || '' });
        await test.save();
        await AIAssessment_1.default.deleteMany({ testId: test._id });
        await PerformanceRecord_1.default.deleteMany({ testId: test._id });
        const profile = await StudentProfile_1.default.findOne({ userId: test.studentId });
        const previous = await AIAssessment_1.default.findOne({ studentId: test.studentId }).sort({ createdAt: -1 });
        const result = (0, assessmentService_1.runAssessment)({ studentId: String(test.studentId), testId: String(test._id), testType, measurements, age: profile ? calcAge(profile.dateOfBirth) : 16, sport, previousScore: previous?.performanceScore });
        await AIAssessment_1.default.create({ studentId: test.studentId, testId: test._id, ...result });
        for (const [metric, value] of Object.entries(measurements))
            if (typeof value === 'number')
                await PerformanceRecord_1.default.create({ testId: test._id, studentId: test.studentId, sport, metric, value, unit: getMeasurementUnit(metric, testType), date: test.testDate, source: 'fitness_test' });
        await StudentProfile_1.default.findOneAndUpdate({ userId: test.studentId }, { potentialFlag: result.potentialFlag, improvementFlag: result.improvementFlag, overallScore: result.performanceScore });
        res.json({ success: true, data: { test, assessment: result } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to update fitness test' });
    }
};
exports.updateTest = updateTest;
const deleteTest = async (req, res) => {
    try {
        const test = await teacherOwnsTest(req.params.id, req.user?.id);
        if (!test)
            return res.status(404).json({ success: false, message: 'Fitness test not found' });
        await Promise.all([test.deleteOne(), AIAssessment_1.default.deleteMany({ testId: test._id }), PerformanceRecord_1.default.deleteMany({ testId: test._id })]);
        res.json({ success: true, message: 'Fitness test deleted' });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to delete fitness test' });
    }
};
exports.deleteTest = deleteTest;
const getTestsByStudent = async (req, res) => {
    try {
        if (req.user?.role === 'PE_TEACHER' && !(await StudentProfile_1.default.exists({ userId: req.params.studentId, teacherId: req.user.id })) && !(await FitnessTest_1.default.exists({ studentId: req.params.studentId, teacherId: req.user.id })))
            return res.status(403).json({ success: false, message: 'Not authorized for this student' });
        const tests = await FitnessTest_1.default.find({ studentId: req.params.studentId }).sort({ testDate: -1 });
        res.json({ success: true, data: tests });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch tests' });
    }
};
exports.getTestsByStudent = getTestsByStudent;
const getMyStudents = async (req, res) => {
    try {
        const studentIds = await FitnessTest_1.default.distinct('studentId', { teacherId: req.user?.id });
        const linkedIds = await StudentProfile_1.default.distinct('userId', { teacherId: req.user?.id });
        const allStudentIds = [...new Set([...studentIds.map(String), ...linkedIds.map(String)])];
        const students = await User_1.default.find({ _id: { $in: allStudentIds }, role: 'STUDENT', isActive: true }).select('-passwordHash');
        const profiles = await StudentProfile_1.default.find({ userId: { $in: allStudentIds } });
        res.json({ success: true, data: { students, profiles } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
};
exports.getMyStudents = getMyStudents;
const getTeacherStats = async (req, res) => {
    try {
        const teacherId = req.user?.id;
        const totalTests = await FitnessTest_1.default.countDocuments({ teacherId });
        const testedIds = await FitnessTest_1.default.distinct('studentId', { teacherId });
        const linkedIds = await StudentProfile_1.default.distinct('userId', { teacherId });
        const studentIds = [...new Set([...testedIds.map(String), ...linkedIds.map(String)])];
        const flagged = await StudentProfile_1.default.countDocuments({ userId: { $in: studentIds }, potentialFlag: true });
        const improving = await StudentProfile_1.default.countDocuments({ userId: { $in: studentIds }, improvementFlag: true });
        res.json({ success: true, data: { totalTests, totalStudents: studentIds.length, flagged, improving } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};
exports.getTeacherStats = getTeacherStats;
