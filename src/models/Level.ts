import mongoose, { Schema, Document } from 'mongoose';

export interface ILevel extends Document {
  levelNumber: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const levelSchema = new Schema<ILevel>(
  {
    levelNumber: {
      type: Number,
      required: [true, 'Level number is required'],
      unique: true,
      min: 1,
      max: 10,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

levelSchema.index({ levelNumber: 1 });

export const Level = mongoose.model<ILevel>('Level', levelSchema);
