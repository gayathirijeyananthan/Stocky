import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import shopRoutes from './routes/shops';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

dotenv.config();

const app = express();

// __dirname is available under CommonJS (tsconfig module: commonjs)

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/shops', shopRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client build in production (or when build exists)
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Root route serves index.html
  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  // SPA fallback for client-side routing (avoid /api)
  app.get(/^(?!\/api).*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || process.env.DB_NAME;

async function startServer(): Promise<void> {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI, MONGO_DB_NAME ? { dbName: MONGO_DB_NAME } : undefined);
      console.log(`Connected to MongoDB${MONGO_DB_NAME ? ` (db: ${MONGO_DB_NAME})` : ''}`);
    } else {
      console.warn('MONGODB_URI not set. Starting server without database connection.');
    }

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void startServer();


