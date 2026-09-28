import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Video from '../models/Video';
import FitnessTest from '../models/FitnessTest';

export const uploadVideo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { studentId, testId, consent } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required' });
    if (consent !== 'true') return res.status(400).json({ success: false, message: 'Consent must be confirmed' });

    const video = await Video.create({
      studentId,
      uploadedBy: req.user?.id,
      testId: testId || undefined,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      consent: true,
    });

    // Link video to test if testId provided
    if (testId) {
      await FitnessTest.findByIdAndUpdate(testId, { videoId: video._id });
    }

    res.status(201).json({ success: true, data: video });
  } catch {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const getVideo = async (req: AuthRequest, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    const userId = req.user?.id;
    const role = req.user?.role;

    // Authorization: student can only see their own video; teacher who uploaded; scout/admin can see
    const isOwner = String(video.studentId) === userId;
    const isUploader = String(video.uploadedBy) === userId;
    const isPrivileged = ['SCOUT', 'ADMIN', 'PE_TEACHER'].includes(role || '');

    if (!isOwner && !isUploader && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: video });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch video' });
  }
};

export const getVideosByTest = async (req: AuthRequest, res: Response) => {
  try {
    const test = await FitnessTest.findById(req.params.testId);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const userId = req.user?.id;
    const role = req.user?.role;
    const isOwner = String(test.studentId) === userId;
    const isPrivileged = ['SCOUT', 'ADMIN', 'PE_TEACHER'].includes(role || '');
    if (!isOwner && !isPrivileged) return res.status(403).json({ success: false, message: 'Access denied' });

    const videos = await Video.find({ testId: req.params.testId });
    res.json({ success: true, data: videos });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch videos' });
  }
};
