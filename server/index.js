import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDb } from './db.js';
import { startImapBot, isImapConnected } from './imap-bot.js';
import { setupStaticFiles } from './middleware.js';
import { startAlertChecking } from './alerts.js';

import transactionsRouter from './routes/transactions.js';
import categoriesRouter from './routes/categories.js';
import dashboardRouter from './routes/dashboard.js';
import merchantMappingsRouter from './routes/merchant-mappings.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create data directory if not exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Simple user middleware (for demo, just use hardcoded user)
app.use((req, res, next) => {
  req.userId = 'default-user';
  next();
});

// Serve static files
setupStaticFiles(app);

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`📍 Request: ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/merchant-mappings', merchantMappingsRouter);

// Test route
app.get('/test', (req, res) => {
  res.send('✅ Server is working!');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    imapConnected: isImapConnected()
  });
});

// Start server
async function start() {
  try {
    // Initialize database
    await initDb();
    console.log('✅ Database initialized');

    // Start IMAP bot
    await startImapBot();
    console.log('✅ IMAP bot started');

    // Start alert checking
    startAlertChecking();
    console.log('✅ Alert system started');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`✅ Server is listening and ready for connections!`);
    });

    // Debug: log errors
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
}

start();
