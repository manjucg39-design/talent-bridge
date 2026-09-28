"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideosByTest = exports.getVideo = exports.uploadVideo = void 0;
const Video_1 = __importDefault(require("../models/Video"));
const FitnessTest_1 = __importDefault(require("../models/FitnessTest"));
const uploadVideo = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        const { studentId, testId, consent } = req.body;
        if (!studentId)
            return res.status(400).json({ success: false, message: 'studentId is required' });
        if (consent !== 'true')
            return res.status(400).json({ success: false, message: 'Consent must be confirmed' });
        const video = await Video_1.default.create({
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
            await FitnessTest_1.default.findByIdAndUpdate(testId, { videoId: video._id });
        }
        res.status(201).json({ success: true, data: video });
    }
    catch {
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};
exports.uploadVideo = uploadVideo;
const getVideo = async (req, res) => {
    try {
        const video = await Video_1.default.findById(req.params.id);
        if (!video)
            return res.status(404).json({ success: false, message: 'Video not found' });
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
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch video' });
    }
};
exports.getVideo = getVideo;
const getVideosByTest = async (req, res) => {
    try {
        const test = await FitnessTest_1.default.findById(req.params.testId);
        if (!test)
            return res.status(404).json({ success: false, message: 'Test not found' });
        const userId = req.user?.id;
        const role = req.user?.role;
        const isOwner = String(test.studentId) === userId;
        const isPrivileged = ['SCOUT', 'ADMIN', 'PE_TEACHER'].includes(role || '');
        if (!isOwner && !isPrivileged)
            return res.status(403).json({ success: false, message: 'Access denied' });
        const videos = await Video_1.default.find({ testId: req.params.testId });
        res.json({ success: true, data: videos });
    }
    catch {
        res.status(500).json({ success: false, message: 'Failed to fetch videos' });
    }
};
exports.getVideosByTest = getVideosByTest;
