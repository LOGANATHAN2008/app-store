const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const appsRouter = require('./routes/apps');
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const searchRouter = require('./routes/search');
const uploadRouter = require('./routes/upload');
const queueRouter = require('./routes/queue');
const featuredRouter = require('./routes/featured');
const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews');
const settingsRouter = require('./routes/settings');
const paymentsRouter = require('./routes/payments');
const statsRouter = require('./routes/stats');
const promoRouter = require('./routes/promotions');
const eventsRouter = require('./routes/events');
const launchpadRouter = require('./routes/launchpad');
const developerWebsitesRouter = require('./routes/developerWebsites');

const { errorHandler } = require('./middleware/error');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/apps', appsRouter);
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin/queue', queueRouter);
app.use('/api/featured', featuredRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/promotions', promoRouter);
app.use('/api/events', eventsRouter);
app.use('/api/launchpad', launchpadRouter);
app.use('/api/developer-websites', developerWebsitesRouter);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path, stat) => {
    // Force download for APK files
    if (path.endsWith('.apk')) {
      // Extract filename from the path
      const filename = path.split(/[\/\\]/).pop();
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }
  }
}));

// Error handler (must be last)
// Static file serving for React frontend (in production)
const frontendPath = path.join(__dirname, '../../frontend/dist')
app.use(express.static(frontendPath))

// Catch-all route to serve React index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001

module.exports = app;
