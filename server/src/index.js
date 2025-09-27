import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import issueRoutes from './routes/issue.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

