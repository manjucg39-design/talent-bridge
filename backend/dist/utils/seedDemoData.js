"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const User_1 = __importDefault(require("../models/User"));
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const Application_1 = __importDefault(require("../models/Application"));
const Club_1 = __importDefault(require("../models/Club"));
const TrainingRecord_1 = __importDefault(require("../models/TrainingRecord"));
const Notification_1 = __importDefault(require("../models/Notification"));
const ScoutShortlist_1 = __importDefault(require("../models/ScoutShortlist"));
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-talent-network';
async function ensureNotification(userId, title, message, type, relatedId) {
    const exists = await Notification_1.default.exists({ userId, title, relatedId });
    if (!exists)
        await Notification_1.default.create({ userId, title, message, type, relatedId });
}
async function seedDemoData() {
    await mongoose_1.default.connect(MONGO_URI);
    const [student, kavya, teacher, scout, gov, clubUser, admin] = await Promise.all([
        User_1.default.findOne({ email: 'student@demo.com' }),
        User_1.default.findOne({ email: 'kavya@demo.com' }),
        User_1.default.findOne({ email: 'teacher@demo.com' }),
        User_1.default.findOne({ email: 'scout@demo.com' }),
        User_1.default.findOne({ email: 'gov@demo.com' }),
        User_1.default.findOne({ email: 'club@demo.com' }),
        User_1.default.findOne({ email: 'admin@demo.com' }),
    ]);
    if (!student || !kavya || !teacher || !scout || !gov || !clubUser || !admin)
        throw new Error('Run npm run seed first to create the demo accounts.');
    const opportunity = await Opportunity_1.default.findOne({ organizationId: gov._id, status: 'published' }).sort({ registrationDeadline: 1 });
    const secondOpportunity = await Opportunity_1.default.findOne({ organizationId: gov._id, status: 'published', _id: { $ne: opportunity?._id } });
    if (!opportunity || !secondOpportunity)
        throw new Error('Run npm run seed first to create published demo opportunities.');
    const appOne = await Application_1.default.findOneAndUpdate({ opportunityId: opportunity._id, studentId: student._id }, { $setOnInsert: { status: 'under_review', documents: ['Age proof — DEMO', 'School certificate — DEMO'], notes: 'DEMO application for review workflow.' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const appTwo = await Application_1.default.findOneAndUpdate({ opportunityId: secondOpportunity._id, studentId: kavya._id }, { $setOnInsert: { status: 'submitted', documents: ['Age proof — DEMO'], notes: 'DEMO application submitted.' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const club = await Club_1.default.findOne({ ownerId: clubUser._id, verificationStatus: 'verified' }) || await Club_1.default.findOne({ ownerId: clubUser._id });
    if (club) {
        const exists = await TrainingRecord_1.default.exists({ clubId: club._id, studentId: student._id, activity: 'Sprint Training — DEMO' });
        if (!exists) {
            const record = await TrainingRecord_1.default.create({ clubId: club._id, studentId: student._id, activity: 'Sprint Training — DEMO', performance: '100m: 14.0 sec', coachNotes: 'Improved acceleration. Demo training record.', date: new Date() });
            await ensureNotification(student._id, 'Training progress updated', `${club.name} recorded a new training update for your profile.`, 'training', record._id);
        }
    }
    const shortlist = await ScoutShortlist_1.default.findOne({ scoutId: scout._id, studentId: student._id });
    if (shortlist)
        await ensureNotification(student._id, 'You have been shortlisted', 'A scout has shortlisted your profile for further evaluation.', 'scout', shortlist._id);
    await ensureNotification(student._id, 'Application under review', `Your application for ${opportunity.title} is under review.`, 'application', appOne._id);
    await ensureNotification(kavya._id, 'Application submitted', `Your application for ${secondOpportunity.title} was submitted successfully.`, 'application', appTwo._id);
    await ensureNotification(teacher._id, 'Demo student assessment ready', 'Rahul Kumar has a preliminary assessment ready for review.', 'assessment');
    await ensureNotification(scout._id, 'Demo athletes ready for review', 'Rahul Kumar and Kavya Reddy are available in Athlete Discovery.', 'scout');
    await ensureNotification(gov._id, 'Demo application received', `Applications are available for ${opportunity.title}.`, 'application', appOne._id);
    await ensureNotification(admin._id, 'Verification centre demo queue', 'Pending demo organization, club, and opportunity records are ready for review.', 'verification');
    console.log('Demo data added without clearing existing records.');
    console.log(`Applications: ${await Application_1.default.countDocuments()}`);
    console.log(`Training records: ${await TrainingRecord_1.default.countDocuments()}`);
    console.log(`Notifications: ${await Notification_1.default.countDocuments()}`);
    await mongoose_1.default.disconnect();
}
seedDemoData().catch(error => { console.error(error); process.exit(1); });
