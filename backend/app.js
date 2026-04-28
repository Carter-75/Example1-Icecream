// --- Environment and Dependencies ---
const path = require('path');
const fs = require('fs');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const resolveEnvPath = () => {
  const candidates = [
    path.join(process.cwd(), '.env.local'), 
    path.join(process.cwd(), 'backend', '.env.local'),
    path.join(__dirname, '../.env.local')
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return null;
};
const envPath = resolveEnvPath();
if (envPath) require('dotenv').config({ path: envPath });
else require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');



const app = express();

// --- Configuration ---
const isProd = process.env.PRODUCTION === 'true' || process.env.VERCEL === '1';
const prodUrl = process.env.PROD_FRONTEND_URL;
const PROJECT_NAME = process.env.PROJECT_NAME || 'example1-icecream';

// Trust proxy for secure cookies on Vercel
if (isProd) {
  app.set('trust proxy', 1);
}

// Frame Ancestors for Iframe Security
const frameAncestors = ["'self'", "https://carter-portfolio.fyi", "https://carter-portfolio.vercel.app", "https://*.vercel.app", `http://localhost:${process.env.PORT || '3000'}`];

if (prodUrl) frameAncestors.push(prodUrl);
if (process.env.PROD_BACKEND_URL) frameAncestors.push(process.env.PROD_BACKEND_URL);

// --- Models & Passport Config ---


// --- Routers ---
const trucksRouter = require('./routes/trucks');

// --- Seeding Logic ---
const Truck = require('./models/truck');
const seedTrucks = async () => {
  const count = await Truck.countDocuments();
  if (count === 0) {
    console.log('INFO: Seeding initial truck data...');
    await Truck.create([
      {
        name: "The Pink Swirl",
        driver: "Sarah Jenkins",
        phone: "555-0234",
        currentLocation: "Central Park West",
        route: ["Columbus Circle", "72nd St", "Strawberry Fields"],
        image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Frosty Delights",
        driver: "Mike Thompson",
        phone: "555-0892",
        currentLocation: "Hudson River Park",
        route: ["Pier 45", "Chelsea Piers", "Battery Park"],
        image: "https://images.unsplash.com/photo-1501443762994-82bd5dabb892?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Sweet Wheels",
        driver: "Anita Patel",
        phone: "555-0112",
        currentLocation: "Washington Square Park",
        route: ["Union Square", "Astor Place", "SoHo"],
        image: "https://images.unsplash.com/photo-1565035010268-a3816f98589a?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Galaxy Scoops",
        driver: "Leo Vance",
        phone: "555-0921",
        currentLocation: "Brooklyn Bridge Park",
        route: ["DUMBO", "Brooklyn Heights", "Cobble Hill"],
        image: "https://images.unsplash.com/photo-1505394033323-4241b2213fd3?auto=format&fit=crop&q=80&w=400"
      },
      {
        name: "Minty Fresh",
        driver: "Chloe Chen",
        phone: "555-0443",
        currentLocation: "Williamsburg Waterfront",
        route: ["McCarren Park", "Greenpoint", "Bushwick"],
        image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=400"
      }
    ]);
    console.log('OK: Seeding complete');
  }
};


// --- Diagnostic Routes ---
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    database: isConnected ? 'Connected' : 'Disconnected',
    env: isProd ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// --- MongoDB Setup ---
const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!mongoURI) {
    console.warn('WARN: No MONGODB_URI found in environment!');
    return;
  }

  try {
    console.log('INFO: Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('OK: Connected to MongoDB');
    seedTrucks();
  } catch (err) {
    console.error('ERROR: MongoDB Connection Failed:', err.message);
  }
};

// Initial connection
connectDB();

// --- Middlewares ---

// Wait for DB middleware
const dbCheck = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  if (mongoose.connection.readyState === 0) await connectDB();
  
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (mongoose.connection.readyState === 1) {
      clearInterval(interval);
      return next();
    }
    if (attempts >= 30) {
      clearInterval(interval);
      return res.status(503).json({ 
        error: 'Database connection timeout. Please refresh or check MONGODB_URI.' 
      });
    }
  }, 100);
};

app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));

app.use((req, res, next) => {
  // Dynamically calculate frame ancestors to support various Vercel aliases
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const currentOrigin = `${protocol}://${host}`;
  
  const ancestors = ["'self'", "https://*.vercel.app", "https://carter-portfolio.fyi", "https://www.carter-portfolio.fyi", currentOrigin];
  
  res.setHeader('Content-Security-Policy', `frame-ancestors ${ancestors.join(' ')}`);
  res.setHeader('X-Frame-Options', 'ALLOWALL'); 
  next();
});

// Apply DB check to all /api routes
app.use('/api', dbCheck);

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send(`API for ${PROJECT_NAME} is running`);
});

// Mount at both /api and root to handle Vercel Service prefix stripping
app.use('/api/trucks', trucksRouter);
app.use('/trucks', trucksRouter);



// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: isProd ? {} : err
  });
});

module.exports = app;
