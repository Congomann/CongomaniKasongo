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
import aiRoutes from './routes/ai.routes.js';

// Error handler
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

// Security configuration
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://localhost:5000'];

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
app.use(compression());
app.use(morgan('combined')); // More detailed logging for production
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Input sanitization
app.use(sanitizeHtml);

// Body parsing with size limits
app.use(express.json({ limit: '2mb' })); // Reduced from 10mb for security
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes); // Strict rate limit on auth
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
