import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';

export function toObjectId(id: string, fieldName = 'user_id'): mongoose.Types.ObjectId {
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}: must be a valid MongoDB ObjectId`, 400);
  }
  return new mongoose.Types.ObjectId(id);
}