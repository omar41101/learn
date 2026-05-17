import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  levelId: number;
  score: number;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    levelId: {
      type: Number,
      required: [true, 'Level ID is required'],
      min: 1,
      max: 10,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, unknown>;
        obj.id = String(obj._id);
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  }
);

userProgressSchema.index({ userId: 1, levelId: 1 }, { unique: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
