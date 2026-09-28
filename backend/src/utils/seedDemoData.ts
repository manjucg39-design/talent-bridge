import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';
import Opportunity from '../models/Opportunity';
import Application from '../models/Application';
import Club from '../models/Club';
import TrainingRecord from '../models/TrainingRecord';
import Notification from '../models/Notification';
import ScoutShortlist from '../models/ScoutShortlist';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-talent-network';

async function ensureNotification(userId: mongoose.Types.ObjectId, title: string, message: string, type: string, relatedId?: mongoose.Types.ObjectId) {
  const exists = await Notification.exists({ userId, title, relatedId });
  if (!exists) await Notification.create({ userId, title, message, type, relatedId });
}

async function seedDemoData() {
  await mongoose.connect(MONGO_URI);
  const [student, kavya, teacher, scout, gov, clubUser, admin] = await Promise.all([
    User.findOne({ email: 'student@demo.com' }),
    User.findOne({ email: 'kavya@demo.com' }),
    User.findOne({ email: 'teacher@demo.com' }),
    User.findOne({ email: 'scout@demo.com' }),
    User.findOne({ email: 'gov@demo.com' }),
    User.findOne({ email: 'club@demo.com' }),
    User.findOne({ email: 'admin@demo.com' }),
  ]);
  if (!student || !kavya || !teacher || !scout || !gov || !clubUser || !admin) throw new Error('Run npm run seed first to create the demo accounts.');

  const opportunity = await Opportunity.findOne({ organizationId: gov._id, status: 'published' }).sort({ registrationDeadline: 1 });
  const secondOpportunity = await Opportunity.findOne({ organizationId: gov._id, status: 'published', _id: { $ne: opportunity?._id } });
  if (!opportunity || !secondOpportunity) throw new Error('Run npm run seed first to create published demo opportunities.');

  const appOne = await Application.findOneAndUpdate(
    { opportunityId: opportunity._id, studentId: student._id },
    { $setOnInsert: { status: 'under_review', documents: ['Age proof — DEMO', 'School certificate — DEMO'], notes: 'DEMO application for review workflow.' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const appTwo = await Application.findOneAndUpdate(
    { opportunityId: secondOpportunity._id, studentId: kavya._id },
    { $setOnInsert: { status: 'submitted', documents: ['Age proof — DEMO'], notes: 'DEMO application submitted.' } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const club = await Club.findOne({ ownerId: clubUser._id, verificationStatus: 'verified' }) || await Club.findOne({ ownerId: clubUser._id });
  if (club) {
    const exists = await TrainingRecord.exists({ clubId: club._id, studentId: student._id, activity: 'Sprint Training — DEMO' });
    if (!exists) {
      const record = await TrainingRecord.create({ clubId: club._id, studentId: student._id, activity: 'Sprint Training — DEMO', performance: '100m: 14.0 sec', coachNotes: 'Improved acceleration. Demo training record.', date: new Date() });
      await ensureNotification(student._id, 'Training progress updated', `${club.name} recorded a new training update for your profile.`, 'training', record._id);
    }
  }

  const shortlist = await ScoutShortlist.findOne({ scoutId: scout._id, studentId: student._id });
  if (shortlist) await ensureNotification(student._id, 'You have been shortlisted', 'A scout has shortlisted your profile for further evaluation.', 'scout', shortlist._id);

  await ensureNotification(student._id, 'Application under review', `Your application for ${opportunity.title} is under review.`, 'application', appOne._id);
  await ensureNotification(kavya._id, 'Application submitted', `Your application for ${secondOpportunity.title} was submitted successfully.`, 'application', appTwo._id);
  await ensureNotification(teacher._id, 'Demo student assessment ready', 'Rahul Kumar has a preliminary assessment ready for review.', 'assessment');
  await ensureNotification(scout._id, 'Demo athletes ready for review', 'Rahul Kumar and Kavya Reddy are available in Athlete Discovery.', 'scout');
  await ensureNotification(gov._id, 'Demo application received', `Applications are available for ${opportunity.title}.`, 'application', appOne._id);
  await ensureNotification(admin._id, 'Verification centre demo queue', 'Pending demo organization, club, and opportunity records are ready for review.', 'verification');

  console.log('Demo data added without clearing existing records.');
  console.log(`Applications: ${await Application.countDocuments()}`);
  console.log(`Training records: ${await TrainingRecord.countDocuments()}`);
  console.log(`Notifications: ${await Notification.countDocuments()}`);
  await mongoose.disconnect();
}

seedDemoData().catch(error => { console.error(error); process.exit(1); });