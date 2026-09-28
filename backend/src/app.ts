import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { config } from './config';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import testRoutes from './routes/tests';
import opportunityRoutes from './routes/opportunities';
import clubRoutes from './routes/clubs';
import kicRoutes from './routes/kic';
import scoutRoutes from './routes/scouts';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import videoRoutes from './routes/videos';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/kic', kicRoutes);
app.use('/api/scouts', scoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/videos', videoRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: config.nodeEnv }));

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});

export default app;
