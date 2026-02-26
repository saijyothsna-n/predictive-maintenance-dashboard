import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from './db/database.js';
import AIProvider from './ai/provider.js';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10kb' })); // Limit request body size

// Initialize database
await Database.initialize();

// API Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { machine_id, temperature, vibration, power_consumption, pressure } = req.body;

    // Input validation and sanitization
    const sanitizedMachineId = typeof machine_id === 'string' 
      ? machine_id.trim().replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50)
      : '';
    
    const numTemperature = parseFloat(temperature);
    const numVibration = parseFloat(vibration);
    const numPower = parseFloat(power_consumption);
    const numPressure = parseFloat(pressure);

    // Validate input ranges
    if (!sanitizedMachineId || sanitizedMachineId.length === 0) {
      return res.status(400).json({ 
        error: 'Valid machine ID is required' 
      });
    }
    
    if (isNaN(numTemperature) || numTemperature < -50 || numTemperature > 200) {
      return res.status(400).json({ 
        error: 'Temperature must be between -50°C and 200°C' 
      });
    }
    
    if (isNaN(numVibration) || numVibration < 0 || numVibration > 1000) {
      return res.status(400).json({ 
        error: 'Vibration must be between 0 and 1000 Hz' 
      });
    }
    
    if (isNaN(numPower) || numPower < 0 || numPower > 10000) {
      return res.status(400).json({ 
        error: 'Power consumption must be between 0 and 10000 W' 
      });
    }
    
    if (isNaN(numPressure) || numPressure < 0 || numPressure > 200) {
      return res.status(400).json({ 
        error: 'Pressure must be between 0 and 200 PSI' 
      });
    }

    // Analyze telemetry
    const analysis = await AIProvider.analyzeTelemetry({
      temperature: numTemperature,
      vibration: numVibration,
      power_consumption: numPower,
      pressure: numPressure
    });

    // Prepare data for storage
    const recordData = {
      machine_id: sanitizedMachineId,
      temperature: numTemperature,
      vibration: numVibration,
      power_consumption: numPower,
      pressure: numPressure,
      health_score: analysis.health_score,
      risk_level: analysis.risk_level,
      primary_contributing_sensor: analysis.primary_contributing_sensor,
      recommended_action: analysis.recommended_action
    };

    // Store in database
    await Database.insertAnalysis(recordData);

    // Return analysis result
    res.json({
      success: true,
      data: {
        machine_id,
        ...analysis
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Internal server error during analysis' 
    });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const { machine_id } = req.query;
    
    // Validate and sanitize machine_id parameter
    const sanitizedMachineId = machine_id && typeof machine_id === 'string'
      ? machine_id.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50)
      : null;
    
    const history = await Database.getHistory(sanitizedMachineId);
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      error: 'Internal server error fetching history' 
    });
  }
});

app.get('/api/machines', async (req, res) => {
  try {
    const machines = await Database.getMachineIds();
    res.json({
      success: true,
      data: machines
    });
  } catch (error) {
    console.error('Machines error:', error);
    res.status(500).json({ 
      error: 'Internal server error fetching machines' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mode: process.env.AI_MODE || 'STUB',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available:`);
  console.log(`  POST /api/analyze - Analyze machine telemetry`);
  console.log(`  GET  /api/history - Get analysis history`);
  console.log(`  GET  /api/machines - Get machine IDs`);
  console.log(`  GET  /api/health - Health check`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  Database.close();
  process.exit(0);
});
