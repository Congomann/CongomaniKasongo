import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import leadRoutes from './routes/lead.routes.js';
import clientRoutes from './routes/client.routes.js';
import callbackRoutes from './routes/callback.routes.js';
import commissionRoutes from './routes/commission.routes.js';
import calendarRoutes from './routes/calendar.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import chatRoutes from './routes/chat.routes.js';
import carrierRoutes from './routes/carrier.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import testimonialRoutes from './routes/testimonial.routes.js';
import jobApplicationRoutes from './routes/job-application.routes.js';
import applicationRoutes from './routes/application.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import propertyRoutes from './routes/property.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import accountingRoutes from './routes/accounting.routes.js';
import bankingRoutes from './routes/banking.routes.js';

// Middleware imports
import { errorHandler } from './middleware/error.middleware.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.middleware.js';
import { sanitizeHtml } from './middleware/validation.middleware.js';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/callbacks', callbackRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/carriers', carrierRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/banking', bankingRoutes);

// Error handling
app.use(errorHandler);

// Serve frontend for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
