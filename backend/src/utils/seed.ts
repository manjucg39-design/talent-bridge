import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import Club from '../models/Club';
import KIC from '../models/KIC';
import Opportunity from '../models/Opportunity';
import FitnessTest from '../models/FitnessTest';
import AIAssessment from '../models/AIAssessment';
import PerformanceRecord from '../models/PerformanceRecord';
import Achievement from '../models/Achievement';
import Notification from '../models/Notification';
import ScoutShortlist from '../models/ScoutShortlist';

const DEMO_PASS = process.env.DEMO_PASSWORD || 'Demo@123456';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-talent-network';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Clearing existing data...');
  await Promise.all([
    User.deleteMany({}), StudentProfile.deleteMany({}), Club.deleteMany({}),
    KIC.deleteMany({}), Opportunity.deleteMany({}), FitnessTest.deleteMany({}),
    AIAssessment.deleteMany({}), PerformanceRecord.deleteMany({}),
    Achievement.deleteMany({}), Notification.deleteMany({}),
    ScoutShortlist.deleteMany({}),
  ]);

  const hash = await bcrypt.hash(DEMO_PASS, 12);

  // ── Core demo accounts (all VERIFIED) ──────────────────────────────────────
  const [admin, teacher, scout, gov, clubUser] = await User.insertMany([
    { name: 'Admin User',               email: 'admin@demo.com',   phone: '9000000001', passwordHash: hash, role: 'ADMIN',                   state: 'Karnataka', district: 'Bengaluru Urban', isVerified: true,  verificationStatus: 'VERIFIED' },
    { name: 'Priya Sharma',             email: 'teacher@demo.com', phone: '9000000002', passwordHash: hash, role: 'PE_TEACHER',              state: 'Karnataka', district: 'Mandya',          isVerified: true,  verificationStatus: 'VERIFIED' },
    { name: 'Arjun Scout',              email: 'scout@demo.com',   phone: '9000000003', passwordHash: hash, role: 'SCOUT',                   state: 'Karnataka', district: 'Bengaluru Urban', isVerified: true,  verificationStatus: 'VERIFIED' },
    { name: 'Karnataka Sports Authority', email: 'gov@demo.com',   phone: '9000000004', passwordHash: hash, role: 'GOVERNMENT_ORGANIZATION', state: 'Karnataka', district: 'Bengaluru Urban', isVerified: true,  verificationStatus: 'VERIFIED' },
    { name: 'Mandya Athletics Club',    email: 'club@demo.com',    phone: '9000000005', passwordHash: hash, role: 'CLUB',                    state: 'Karnataka', district: 'Mandya',          isVerified: true,  verificationStatus: 'VERIFIED' },
  ]);

  // ── Pending verification accounts (for Admin demo) ─────────────────────────
  await User.insertMany([
    { name: 'Ravi Nayak (Teacher)',       email: 'teacher2@demo.com', phone: '9000000010', passwordHash: hash, role: 'PE_TEACHER',              state: 'Karnataka', district: 'Hassan',          isVerified: false, verificationStatus: 'PENDING' },
    { name: 'Sanjay Mehta (Scout)',       email: 'scout2@demo.com',   phone: '9000000011', passwordHash: hash, role: 'SCOUT',                   state: 'Karnataka', district: 'Mysuru',          isVerified: false, verificationStatus: 'PENDING' },
    { name: 'Tumkur Sports Foundation',   email: 'org2@demo.com',     phone: '9000000012', passwordHash: hash, role: 'GOVERNMENT_ORGANIZATION', state: 'Karnataka', district: 'Tumkur',          isVerified: false, verificationStatus: 'PENDING' },
  ]);

  // ── Demo students ───────────────────────────────────────────────────────────
  const studentData = [
    { name: 'Rahul Kumar',    email: 'student@demo.com', district: 'Mandya',         dob: new Date('2009-03-15'), gender: 'male',   school: 'Govt High School Mandya',       sports: ['Athletics'],              score: 84, potential: true  },
    { name: 'Kavya Reddy',    email: 'kavya@demo.com',   district: 'Mysuru',         dob: new Date('2008-07-22'), gender: 'female', school: 'Govt Girls School Mysuru',      sports: ['Athletics', 'Badminton'], score: 78, potential: true  },
    { name: 'Suresh Gowda',   email: 'suresh@demo.com',  district: 'Hassan',         dob: new Date('2010-01-10'), gender: 'male',   school: 'Zilla Parishad School Hassan',  sports: ['Football', 'Kabaddi'],    score: 72, potential: false },
    { name: 'Anitha Nair',    email: 'anitha@demo.com',  district: 'Mandya',         dob: new Date('2009-11-05'), gender: 'female', school: 'Govt High School Mandya',       sports: ['Volleyball'],             score: 68, potential: false },
    { name: 'Ravi Patil',     email: 'ravi@demo.com',    district: 'Belagavi',       dob: new Date('2008-04-18'), gender: 'male',   school: 'Govt School Belagavi',          sports: ['Wrestling', 'Athletics'], score: 81, potential: true  },
    { name: 'Deepa Hegde',    email: 'deepa@demo.com',   district: 'Uttara Kannada', dob: new Date('2010-09-30'), gender: 'female', school: 'Govt School Sirsi',             sports: ['Swimming'],               score: 75, potential: true  },
    { name: 'Manjunath B',    email: 'manju@demo.com',   district: 'Tumkur',         dob: new Date('2009-06-12'), gender: 'male',   school: 'Govt School Tumkur',            sports: ['Hockey'],                 score: 70, potential: false },
    { name: 'Pooja Kulkarni', email: 'pooja@demo.com',   district: 'Dharwad',        dob: new Date('2008-12-25'), gender: 'female', school: 'Govt School Dharwad',           sports: ['Basketball'],             score: 77, potential: true  },
  ];

  let rahulUser: (typeof studentData[0] & { _id: mongoose.Types.ObjectId }) | null = null;

  for (const s of studentData) {
    const user = await User.create({
      name: s.name, email: s.email,
      phone: `90000${Math.floor(10000 + Math.random() * 90000)}`,
      passwordHash: DEMO_PASS, role: 'STUDENT',
      state: 'Karnataka', district: s.district,
      isVerified: true, verificationStatus: 'VERIFIED',
    });

    await StudentProfile.create({
      userId: user._id, dateOfBirth: s.dob, gender: s.gender,
      school: s.school, sportInterests: s.sports, parentConsent: true,
      potentialFlag: s.potential, improvementFlag: s.score > 75, overallScore: s.score,
    });

    if (s.email === 'student@demo.com') {
      // ── Fitness tests ──
      const test1 = await FitnessTest.create({
        studentId: user._id, teacherId: teacher._id, testType: 'sprint',
        sport: 'Athletics', measurements: { '100m': 14.2 },
        testDate: new Date('2024-10-15'), verified: true, notes: 'Good track conditions. Morning session.',
      });
      await AIAssessment.create({
        studentId: user._id, testId: test1._id, performanceScore: 84,
        potentialFlag: true, improvementFlag: false,
        strengthAreas: ['Sprint performance', 'Agility'],
        improvementAreas: ['Endurance'],
        recommendation: 'Performance indicates potential. Consider further coaching evaluation.',
        assessmentType: 'preliminary', confidenceScore: 80,
      });

      const test2 = await FitnessTest.create({
        studentId: user._id, teacherId: teacher._id, testType: 'jump',
        sport: 'Athletics', measurements: { 'long_jump': 4.1 },
        testDate: new Date('2024-11-10'), verified: true, notes: 'Sand pit. Afternoon session.',
      });
      await AIAssessment.create({
        studentId: user._id, testId: test2._id, performanceScore: 78,
        potentialFlag: true, improvementFlag: false,
        strengthAreas: ['Long jump technique'],
        improvementAreas: ['Approach run speed'],
        recommendation: 'Good jump mechanics. Work on approach run speed.',
        assessmentType: 'preliminary', confidenceScore: 70,
      });

      // ── Performance history ──
      const perfData = [
        { m: 1, v: 15.8 }, { m: 3, v: 15.1 }, { m: 6, v: 14.5 }, { m: 9, v: 14.2 },
      ];
      for (const { m, v } of perfData) {
        await PerformanceRecord.create({
          studentId: user._id, sport: 'Athletics', metric: '100m',
          value: v, unit: 'seconds', date: new Date(2024, m - 1, 15), source: 'fitness_test',
        });
      }

      // ── Achievements ──
      await Achievement.insertMany([
        { studentId: user._id, title: 'District Athletics Meet — 2nd Place', type: 'medal', organization: 'Mandya District Sports Authority', date: new Date('2024-08-20'), result: '2nd Place, 100m Sprint (14.5s)', verified: true },
        { studentId: user._id, title: 'Personal Best — 100m Sprint', type: 'personal_best', organization: 'School Sports Day', date: new Date('2024-10-15'), result: '14.2 seconds', verified: false },
        { studentId: user._id, title: 'Taluk Athletics Championship', type: 'participation', organization: 'Mandya Taluk Sports', date: new Date('2024-07-05'), result: 'Participated — 100m, 200m', verified: true },
        { studentId: user._id, title: '12% Performance Improvement', type: 'competition_result', organization: 'RTN Platform Assessment', date: new Date('2024-10-15'), result: 'Improved from 15.8s to 14.2s over 9 months', verified: false },
      ]);

      // ── Notifications ──
      await Notification.insertMany([
        { userId: user._id, title: 'New Opportunity Matched', message: 'District Athletics Selection Trial matches your profile with 94% score. Registration closes in 30 days.', type: 'opportunity', read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { userId: user._id, title: 'Fitness Assessment Ready', message: 'Your Sprint test has been assessed. Performance Score: 84. Potential flag set.', type: 'assessment', read: false, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        { userId: user._id, title: 'You Have Been Shortlisted', message: 'A scout has shortlisted your profile for further evaluation.', type: 'scout', read: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { userId: user._id, title: 'New Opportunity Available', message: 'Khelo India Talent Identification Camp — Athletics is now open for applications.', type: 'opportunity', read: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { userId: user._id, title: 'Performance Improvement Detected', message: 'Your 100m time improved by 12% over the last 9 months. Keep it up!', type: 'assessment', read: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      ]);

      // Store ref for later
      (rahulUser as unknown) = { ...s, _id: user._id };
    }
  }

  // ── Teacher notifications ──
  await Notification.insertMany([
    { userId: teacher._id, title: 'Student Flagged for Evaluation', message: 'Rahul Kumar has been flagged as a potential talent based on sprint assessment.', type: 'assessment', read: false, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { userId: teacher._id, title: 'Assessment Completed', message: 'AI preliminary assessment generated for Rahul Kumar. Score: 84.', type: 'assessment', read: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  ]);

  const rahul = await User.findOne({ email: 'student@demo.com' });
  const kavya = await User.findOne({ email: 'kavya@demo.com' });
  if (rahul && kavya) {
    await ScoutShortlist.insertMany([
      { scoutId: scout._id, studentId: rahul._id, status: 'shortlisted', notes: 'Strong sprint profile. Invite for track evaluation.', createdAt: new Date(Date.now() - 2 * 86400000) },
      { scoutId: scout._id, studentId: kavya._id, status: 'evaluation_requested', notes: 'Review agility progression and request a badminton assessment.', createdAt: new Date(Date.now() - 86400000) },
    ]);
  }

  // ── Scout notifications ──
  await Notification.insertMany([
    { userId: scout._id, title: 'New Potential Athlete', message: 'Rahul Kumar (Athletics, Mandya) has been flagged with potential. Score: 84.', type: 'scout', read: false, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { userId: scout._id, title: 'New Improving Athlete', message: 'Kavya Reddy (Athletics, Mysuru) shows significant improvement. Score: 78.', type: 'scout', read: false, createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000) },
  ]);

  // ── Clubs ──
  await Club.insertMany([
    { ownerId: clubUser._id, name: 'Mandya Athletics Club', description: 'Premier athletics training centre in Mandya', sports: ['Athletics'], state: 'Karnataka', district: 'Mandya', address: 'Near District Stadium, Mandya', contactEmail: 'club@demo.com', contactPhone: '9876543210', coaches: ['Coach Ramesh', 'Coach Sunita'], ageGroups: ['U14', 'U17', 'U20'], trainingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'], verificationStatus: 'verified', isDemo: true },
    { ownerId: clubUser._id, name: 'Mysuru Football Academy', description: 'Football training for youth', sports: ['Football'], state: 'Karnataka', district: 'Mysuru', address: 'Mysuru Sports Complex', contactEmail: 'mysurufootball@demo.com', contactPhone: '9876543211', coaches: ['Coach Venkat'], ageGroups: ['U12', 'U14', 'U17'], trainingDays: ['Tuesday', 'Thursday', 'Saturday'], verificationStatus: 'verified', isDemo: true },
    { ownerId: clubUser._id, name: 'Bengaluru Badminton Centre', description: 'Badminton coaching for all levels', sports: ['Badminton'], state: 'Karnataka', district: 'Bengaluru Urban', address: 'Koramangala Indoor Stadium', contactEmail: 'bbc@demo.com', contactPhone: '9876543212', coaches: ['Coach Anand', 'Coach Meera'], ageGroups: ['U12', 'U14', 'U17', 'U20'], trainingDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'], verificationStatus: 'verified', isDemo: true },
    { ownerId: clubUser._id, name: 'Hassan Kabaddi Club', description: 'Traditional sport, modern training', sports: ['Kabaddi'], state: 'Karnataka', district: 'Hassan', address: 'Hassan Sports Ground', contactEmail: 'hassankabaddi@demo.com', contactPhone: '9876543213', coaches: ['Coach Basavanna'], ageGroups: ['U14', 'U17'], trainingDays: ['Monday', 'Wednesday', 'Friday'], verificationStatus: 'pending', isDemo: true },
    { ownerId: clubUser._id, name: 'Belagavi Wrestling Academy', description: 'Traditional wrestling training', sports: ['Wrestling'], state: 'Karnataka', district: 'Belagavi', address: 'Belagavi Akhada', contactEmail: 'belagaviwrestling@demo.com', contactPhone: '9876543214', coaches: ['Coach Mallappa'], ageGroups: ['U14', 'U17', 'U20'], trainingDays: ['Daily'], verificationStatus: 'verified', isDemo: true },
  ]);

  // ── KICs ──
  await KIC.insertMany([
    { name: 'Khelo India Centre — Mandya (DEMO)', sports: ['Athletics', 'Kabaddi', 'Volleyball'], state: 'Karnataka', district: 'Mandya', address: 'District Sports Complex, Mandya', contactEmail: 'kic.mandya@demo.com', contactPhone: '9800000001', eligibility: 'Age 10–18, Karnataka domicile', trainingInfo: 'Free coaching, equipment provided. Morning and evening batches.', verificationStatus: 'verified', isDemo: true },
    { name: 'Khelo India Centre — Mysuru (DEMO)', sports: ['Athletics', 'Football', 'Basketball'], state: 'Karnataka', district: 'Mysuru', address: 'Mysuru Sports Authority Complex', contactEmail: 'kic.mysuru@demo.com', contactPhone: '9800000002', eligibility: 'Age 10–18, Karnataka domicile', trainingInfo: 'Free coaching. Selection based on fitness test.', verificationStatus: 'verified', isDemo: true },
    { name: 'Khelo India Centre — Bengaluru (DEMO)', sports: ['Badminton', 'Swimming', 'Hockey'], state: 'Karnataka', district: 'Bengaluru Urban', address: 'Kanteerava Stadium, Bengaluru', contactEmail: 'kic.bengaluru@demo.com', contactPhone: '9800000003', eligibility: 'Age 10–18, Karnataka domicile', trainingInfo: 'World-class facilities. Residential programme available.', verificationStatus: 'verified', isDemo: true },
  ]);

  // ── Opportunities ──
  const deadline = new Date(); deadline.setDate(deadline.getDate() + 30);
  const start = new Date(); start.setDate(start.getDate() + 45);
  const end = new Date(); end.setDate(end.getDate() + 47);

  await Opportunity.insertMany([
    { organizationId: gov._id, title: 'District Athletics Selection Trial — DEMO', type: 'District Trial', sport: 'Athletics', description: 'Annual district-level athletics selection trial for identifying talented athletes for state-level competitions. Events include 100m, 200m, long jump, and high jump.', startDate: start, endDate: end, registrationDeadline: deadline, location: 'District Stadium, Mandya', state: 'Karnataka', district: 'Mandya', ageMin: 14, ageMax: 17, gender: 'all', eligibility: 'Karnataka domicile. Age 14–17 as on trial date. School enrollment certificate required.', documents: ['School enrollment certificate', 'Age proof', 'Domicile certificate'], selectionProcess: 'Performance-based selection. Top 5 athletes per event qualify for state trial.', applicationUrl: '', contactEmail: 'sports@mandya.gov.in', contactPhone: '9900000001', slots: 50, verificationStatus: 'approved', status: 'published', isDemo: true },
    { organizationId: gov._id, title: 'Khelo India Talent Identification Camp — Athletics (DEMO)', type: 'Talent Identification Camp', sport: 'Athletics', description: 'State-level talent identification camp under Khelo India programme. Promising athletes will be assessed for Khelo India scholarship.', startDate: new Date(start.getTime() + 30 * 86400000), endDate: new Date(end.getTime() + 35 * 86400000), registrationDeadline: new Date(deadline.getTime() + 20 * 86400000), location: 'Kanteerava Stadium, Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', ageMin: 12, ageMax: 18, gender: 'all', eligibility: 'Karnataka domicile. Age 12–18. Must have participated in district-level competition.', documents: ['Age proof', 'Domicile certificate', 'District participation certificate'], selectionProcess: 'Multi-event assessment. Selected athletes considered for Khelo India scholarship.', applicationUrl: '', contactEmail: 'kheloindia.karnataka@demo.com', contactPhone: '9900000002', slots: 100, verificationStatus: 'approved', status: 'published', isDemo: true },
    { organizationId: gov._id, title: 'State Football Selection Trial — U17 (DEMO)', type: 'State Trial', sport: 'Football', description: 'Karnataka state U17 football team selection trial.', startDate: new Date(start.getTime() + 15 * 86400000), endDate: new Date(end.getTime() + 16 * 86400000), registrationDeadline: new Date(deadline.getTime() + 10 * 86400000), location: 'Mysuru Football Ground', state: 'Karnataka', district: 'Mysuru', ageMin: 14, ageMax: 17, gender: 'male', eligibility: 'Karnataka domicile. Age 14–17 boys.', documents: ['Age proof', 'Domicile certificate'], selectionProcess: 'Trial match. 22 players selected for state squad.', applicationUrl: '', contactEmail: 'football.karnataka@demo.com', contactPhone: '9900000003', slots: 60, verificationStatus: 'approved', status: 'published', isDemo: true },
    { organizationId: gov._id, title: 'Rural Sports Scholarship Programme (DEMO)', type: 'Scholarship', sport: 'Athletics', description: 'Scholarship for promising rural athletes to support training and competition expenses.', startDate: start, endDate: new Date(end.getTime() + 365 * 86400000), registrationDeadline: deadline, location: 'Online Application', state: 'Karnataka', district: '', ageMin: 12, ageMax: 20, gender: 'all', eligibility: 'Rural Karnataka domicile. Annual family income below 3 lakh. Active sports participation.', documents: ['Income certificate', 'Domicile certificate', 'Sports achievement proof'], selectionProcess: 'Document verification and performance assessment.', applicationUrl: '', contactEmail: 'scholarship@demo.com', contactPhone: '9900000004', slots: 25, verificationStatus: 'approved', status: 'published', isDemo: true },
    // Pending opportunity for admin demo
    { organizationId: gov._id, title: 'Tumkur District Hockey Trial (DEMO — Pending)', type: 'District Trial', sport: 'Hockey', description: 'District-level hockey selection trial for U17 category.', startDate: new Date(start.getTime() + 60 * 86400000), endDate: new Date(end.getTime() + 62 * 86400000), registrationDeadline: new Date(deadline.getTime() + 50 * 86400000), location: 'Tumkur Sports Ground', state: 'Karnataka', district: 'Tumkur', ageMin: 14, ageMax: 17, gender: 'all', eligibility: 'Karnataka domicile.', documents: ['Age proof'], selectionProcess: 'Trial match.', applicationUrl: '', contactEmail: 'hockey.tumkur@demo.com', contactPhone: '9900000005', slots: 30, verificationStatus: 'pending', status: 'draft', isDemo: true },
  ]);

  console.log('✅ Seed complete. Demo accounts:');
  console.log('  student@demo.com / teacher@demo.com / scout@demo.com / gov@demo.com / club@demo.com / admin@demo.com');
  console.log('  Pending verification: teacher2@demo.com / scout2@demo.com / org2@demo.com');
  console.log(`  Password: ${DEMO_PASS}`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
