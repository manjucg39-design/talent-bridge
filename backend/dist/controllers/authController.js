"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const StudentProfile_1 = __importDefault(require("../models/StudentProfile"));
const Notification_1 = __importDefault(require("../models/Notification"));
const config_1 = require("../config");
const signToken = (id, role, email) => jsonwebtoken_1.default.sign({ id, role, email }, config_1.config.jwtSecret, { expiresIn: '7d' });
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role, state, district, location, dateOfBirth, gender, school, sportInterests, parentConsent } = req.body;
        const exists = await User_1.default.findOne({ email });
        if (exists)
            return res.status(400).json({ success: false, message: 'Email already registered' });
        const autoVerifiedRoles = ['ADMIN'];
        const verificationStatus = autoVerifiedRoles.includes(role) ? 'VERIFIED' : 'PENDING';
        const isVerified = autoVerifiedRoles.includes(role);
        const user = await User_1.default.create({ name, email, phone, passwordHash: password, role, state, district, location: location || '', isVerified, verificationStatus });
        if (role === 'STUDENT' && dateOfBirth) {
            await StudentProfile_1.default.create({
                userId: user._id, dateOfBirth, gender, school: school || '', sportInterests: sportInterests || [],
                parentConsent: parentConsent || false,
            });
        }
        if (role !== 'ADMIN') {
            const admins = await User_1.default.find({ role: 'ADMIN', isActive: true }).select('_id');
            if (admins.length)
                await Notification_1.default.insertMany(admins.map(admin => ({
                    userId: admin._id,
                    title: 'New verification request',
                    message: `${user.name} registered as ${String(role).replace('_', ' ')} and is awaiting verification.`,
                    type: 'verification',
                    relatedId: user._id,
                })));
            await Notification_1.default.create({ userId: user._id, title: 'Verification pending', message: 'Your account is pending administrator verification. You will be notified when it is approved or rejected.', type: 'verification', relatedId: user._id });
        }
        const token = signToken(String(user._id), user.role, user.email);
        res.status(201).json({ success: true, message: 'Registration successful', data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        res.status(500).json({ success: false, message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        if (!user.isActive)
            return res.status(403).json({ success: false, message: 'Account suspended' });
        const token = signToken(String(user._id), user.role, user.email);
        res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, state: user.state, district: user.district } } });
    }
    catch {
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('-passwordHash');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
};
exports.getMe = getMe;
