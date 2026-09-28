import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FitnessTest from '../models/FitnessTest';
import AIAssessment from '../models/AIAssessment';
import StudentProfile from '../models/StudentProfile';
import PerformanceRecord from '../models/PerformanceRecord';
import Notification from '../models/Notification';
import { runAssessment } from '../services/assessmentService';
import User from '../models/User';

const calcAge = (dob: Date) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
};

const getMeasurementUnit = (metric: string, testType: string) => {
  if (testType === 'strength') return 'reps';
  if (testType === 'jump') return 'meters';
  return 'seconds';
};

export const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, testType, sport, measurements, testDate, notes, videoId } = req.body;
    const student = await User.findOne({ _id: studentId, role: 'STUDENT', isActive: true });
    const profile = await StudentProfile.findOne({ userId: studentId });
    const teacherOwnsStudent = profile?.teacherId?.toString() === req.user?.id || Boolean(await FitnessTest.exists({ studentId, teacherId: req.user?.id }));
    const hasValidMeasurements = measurements && Object.values(measurements).some(value => typeof value === 'number' && Number.isFinite(value) && value > 0);
    if (!student || !profile || !teacherOwnsStudent) return res.status(403).json({ success: false, message: 'Select a student registered with you' });
    if (!hasValidMeasurements) return res.status(400).json({ success: false, message: 'Enter at least one positive measurement' });
    if (testDate && new Date(testDate) > new Date()) return res.status(400).json({ success: false, message: 'Test date cannot be in the future' });
    const test = await FitnessTest.create({
      studentId, teacherId: req.user?.id, testType, sport,
      measurements, testDate: testDate || new Date(), notes: notes || '', videoId,
    });

    // Auto-run AI assessment
    const age = calcAge(profile.dateOfBirth);
    const prevAssessment = await AIAssessment.findOne({ studentId }).sort({ createdAt: -1 });

    const result = runAssessment({
      studentId, testId: String(test._id), testType, measurements, age, sport,
      previousScore: prevAssessment?.performanceScore,
    });

    const assessment = await AIAssessment.create({ studentId, testId: test._id, ...result });

    // Update student flags
    await StudentProfile.findOneAndUpdate({ userId: studentId }, {
      potentialFlag: result.potentialFlag,
      improvementFlag: result.improvementFlag,
      overallScore: result.performanceScore,
    });

    // Save performance record
    for (const [metric, value] of Object.entries(measurements)) {
      if (typeof value === 'number') {
        await PerformanceRecord.create({ testId: test._id, studentId, sport, metric, value, unit: getMeasurementUnit(metric, testType), date: testDate || new Date(), source: 'fitness_test' });
      }
    }

    // Notify student
    await Notification.create({
      userId: studentId,
      title: 'New Fitness Assessment Ready',
      message: `Your ${testType} test has been assessed. Score: ${result.performanceScore}`,
      type: 'assessment',
      relatedId: assessment._id,
    });
    await Notification.create({ userId: req.user!.id, title: 'Fitness assessment saved', message: `Assessment completed for ${student.name}. Score: ${result.performanceScore}.`, type: 'assessment', relatedId: test._id });

    res.status(201).json({ success: true, data: { test, assessment } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create test';
    res.status(500).json({ success: false, message });
  }
};

const teacherOwnsTest = async (testId: string, teacherId?: string) => {
  if (!teacherId) return null;
  return FitnessTest.findOne({ _id: testId, teacherId });
};

export const updateTest = async (req: AuthRequest, res: Response) => {
  try {
    const test = await teacherOwnsTest(req.params.id, req.user?.id);
    if (!test) return res.status(404).json({ success: false, message: 'Fitness test not found' });
    const { testType, sport, measurements, testDate, notes } = req.body;
    const hasValidMeasurements = measurements && Object.values(measurements).some(value => typeof value === 'number' && Number.isFinite(value) && value > 0);
    if (!testType || !sport || !hasValidMeasurements) return res.status(400).json({ success: false, message: 'Test type, sport, and a positive measurement are required' });
    if (testDate && new Date(testDate) > new Date()) return res.status(400).json({ success: false, message: 'Test date cannot be in the future' });
    Object.assign(test, { testType, sport, measurements, testDate: testDate || test.testDate, notes: notes || '' });
    await test.save();
    await AIAssessment.deleteMany({ testId: test._id });
    await PerformanceRecord.deleteMany({ testId: test._id });
    const profile = await StudentProfile.findOne({ userId: test.studentId });
    const previous = await AIAssessment.findOne({ studentId: test.studentId }).sort({ createdAt: -1 });
    const result = runAssessment({ studentId: String(test.studentId), testId: String(test._id), testType, measurements, age: profile ? calcAge(profile.dateOfBirth) : 16, sport, previousScore: previous?.performanceScore });
    await AIAssessment.create({ studentId: test.studentId, testId: test._id, ...result });
    for (const [metric, value] of Object.entries(measurements)) if (typeof value === 'number') await PerformanceRecord.create({ testId: test._id, studentId: test.studentId, sport, metric, value, unit: getMeasurementUnit(metric, testType), date: test.testDate, source: 'fitness_test' });
    await StudentProfile.findOneAndUpdate({ userId: test.studentId }, { potentialFlag: result.potentialFlag, improvementFlag: result.improvementFlag, overallScore: result.performanceScore });
    res.json({ success: true, data: { test, assessment: result } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update fitness test' });
  }
};

export const deleteTest = async (req: AuthRequest, res: Response) => {
  try {
    const test = await teacherOwnsTest(req.params.id, req.user?.id);
    if (!test) return res.status(404).json({ success: false, message: 'Fitness test not found' });
    await Promise.all([test.deleteOne(), AIAssessment.deleteMany({ testId: test._id }), PerformanceRecord.deleteMany({ testId: test._id })]);
    res.json({ success: true, message: 'Fitness test deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete fitness test' });
  }
};

export const getTestsByStudent = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'PE_TEACHER' && !(await StudentProfile.exists({ userId: req.params.studentId, teacherId: req.user.id })) && !(await FitnessTest.exists({ studentId: req.params.studentId, teacherId: req.user.id }))) return res.status(403).json({ success: false, message: 'Not authorized for this student' });
    const tests = await FitnessTest.find({ studentId: req.params.studentId }).sort({ testDate: -1 });
    res.json({ success: true, data: tests });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch tests' });
  }
};

export const getMyStudents = async (req: AuthRequest, res: Response) => {
  try {
    const studentIds = await FitnessTest.distinct('studentId', { teacherId: req.user?.id });
    const linkedIds = await StudentProfile.distinct('userId', { teacherId: req.user?.id });
    const allStudentIds = [...new Set([...studentIds.map(String), ...linkedIds.map(String)])];
    const students = await User.find({ _id: { $in: allStudentIds }, role: 'STUDENT', isActive: true }).select('-passwordHash');
    const profiles = await StudentProfile.find({ userId: { $in: allStudentIds } });
    res.json({ success: true, data: { students, profiles } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

export const getTeacherStats = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const totalTests = await FitnessTest.countDocuments({ teacherId });
    const testedIds = await FitnessTest.distinct('studentId', { teacherId });
    const linkedIds = await StudentProfile.distinct('userId', { teacherId });
    const studentIds = [...new Set([...testedIds.map(String), ...linkedIds.map(String)])];
    const flagged = await StudentProfile.countDocuments({ userId: { $in: studentIds }, potentialFlag: true });
    const improving = await StudentProfile.countDocuments({ userId: { $in: studentIds }, improvementFlag: true });
    res.json({ success: true, data: { totalTests, totalStudents: studentIds.length, flagged, improving } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
