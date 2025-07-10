import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
