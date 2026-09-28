import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import StudentProfile from '../models/StudentProfile';
import Notification from '../models/Notification';
import { config } from '../config';

const signToken = (id: string, role: string, email: string) =>
  jwt.sign({ id, role, email }, config.jwtSecret as string, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, state, district, location, dateOfBirth, gender, school, sportInterests, parentConsent } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const autoVerifiedRoles = ['ADMIN'];
    const verificationStatus = autoVerifiedRoles.includes(role) ? 'VERIFIED' : 'PENDING';
    const isVerified = autoVerifiedRoles.includes(role);

    const user = await User.create({ name, email, phone, passwordHash: password, role, state, district, location: location || '', isVerified, verificationStatus });

    if (role === 'STUDENT' && dateOfBirth) {
      await StudentProfile.create({
        userId: user._id, dateOfBirth, gender, school: school || '', sportInterests: sportInterests || [],
        parentConsent: parentConsent || false,
      });
    }

    if (role !== 'ADMIN') {
      const admins = await User.find({ role: 'ADMIN', isActive: true }).select('_id');
      if (admins.length) await Notification.insertMany(admins.map(admin => ({
        userId: admin._id,
        title: 'New verification request',
        message: `${user.name} registered as ${String(role).replace('_', ' ')} and is awaiting verification.`,
        type: 'verification',
        relatedId: user._id,
      })));
      await Notification.create({ userId: user._id, title: 'Verification pending', message: 'Your account is pending administrator verification. You will be notified when it is approved or rejected.', type: 'verification', relatedId: user._id });
    }

    const token = signToken(String(user._id), user.role, user.email);
    res.status(201).json({ success: true, message: 'Registration successful', data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ success: false, message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account suspended' });

    const token = signToken(String(user._id), user.role, user.email);
    res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, state: user.state, district: user.district } } });
  } catch {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};
