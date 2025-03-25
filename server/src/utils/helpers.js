import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const generateToken = (id) =>
