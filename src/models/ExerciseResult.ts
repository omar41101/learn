import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExerciseResult extends Document {
  userId: Types.ObjectId;
  exerciseId: number;
  levelId: number;
  score: number;
  attempts: number;
  isCorrect: boolean;
  userAnswer: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseResultSchema = new Schema<IExerciseResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    exerciseId: {
      type: Number,
      required: [true, 'Exercise ID is required'],
      min: 1,
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
    attempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    userAnswer: {
      type: Schema.Types.Mixed,
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

exerciseResultSchema.index({ userId: 1, exerciseId: 1, createdAt: -1 });
exerciseResultSchema.index({ userId: 1, levelId: 1 });

export const ExerciseResult = mongoose.model<IExerciseResult>('ExerciseResult', exerciseResultSchema);
