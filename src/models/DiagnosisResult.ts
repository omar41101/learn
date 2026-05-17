import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDiagnosisResult extends Document {
  userId: Types.ObjectId;
  diagnosisGroup: number;
  score: number;
  totalTimeSeconds: number;
  avgTimePerQuestion: number;
  recommendedLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const diagnosisResultSchema = new Schema<IDiagnosisResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    diagnosisGroup: {
      type: Number,
      default: 1,
      min: 1,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTimeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgTimePerQuestion: {
      type: Number,
      default: 0,
      min: 0,
    },
    recommendedLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
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

diagnosisResultSchema.index({ userId: 1, createdAt: -1 });

export const DiagnosisResult = mongoose.model<IDiagnosisResult>('DiagnosisResult', diagnosisResultSchema);
