import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';
import type { AuthUser } from '../types/index.js';

function signToken(user: Pick<IUser, 'id' | 'username'>): string {
  return jwt.sign(
    { userId: user.id, username: user.username },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user: IUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    userType: user.userType,
    user_type: user.userType,
    fullName: user.fullName,
    full_name: user.fullName,
  };
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  userType: 'student' | 'teacher' = 'student',
  fullName = ''
): Promise<{ user: ReturnType<typeof sanitizeUser>; token: string }> {
  const existing = await User.findOne({ $or: [{ username }, { email }] }).lean();
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({ username, email, password, userType, fullName });
  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

export async function quickRegisterUser(
  fullName: string
): Promise<{ user: { id: string; username: string; fullName: string; full_name: string; userType: string; user_type: string }; token: string }> {
  const timestamp = Date.now();
  const username = `student_${timestamp}`;
  const email = `${username}@example.com`;

  const user = await User.create({
    username,
    email,
    password: username,
    userType: 'student',
    fullName: fullName.trim(),
  });

  const token = signToken(user);
  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      full_name: user.fullName,
      userType: user.userType,
      user_type: user.userType,
    },
    token,
  };
}

export async function loginUser(
  username: string,
  password: string,
  role?: string
): Promise<{ user: ReturnType<typeof sanitizeUser>; token: string }> {
  const query = role === 'teacher'
    ? { $or: [{ username }, { email: username }] }
    : { username };

  const user = await User.findOne(query).select('+password');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new AppError('Invalid credentials', 401);
  }

  if (role && user.userType !== role) {
    throw new AppError('نوع الحساب غير مطابق للدور المختار', 403);
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

export async function getUserProfile(userId: string): Promise<ReturnType<typeof sanitizeUser>> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
}

export async function updateUserProfile(
  userId: string,
  updates: { fullName?: string; email?: string }
): Promise<ReturnType<typeof sanitizeUser>> {
  const updateData: Record<string, string> = {};
  if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
  if (updates.email !== undefined) updateData.email = updates.email;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return sanitizeUser(user);
}

export async function getAllStudents(): Promise<Array<Record<string, unknown>>> {
  const students = await User.find({ userType: 'student' })
    .select('username email fullName createdAt')
    .sort({ createdAt: -1 })
    .lean();
  return students.map((s) => ({
    id: s._id.toString(),
    username: s.username,
    email: s.email,
    fullName: s.fullName,
    full_name: s.fullName,
    createdAt: s.createdAt,
  }));
}

export async function createStudent(data: {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}): Promise<ReturnType<typeof sanitizeUser>> {
  const existing = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] }).lean();
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  const user = await User.create({
    username: data.username,
    email: data.email,
    password: data.password,
    userType: 'student',
    fullName: data.fullName || '',
  });
  return sanitizeUser(user);
}

export async function updateStudent(
  studentId: string,
  updates: { fullName?: string; email?: string }
): Promise<ReturnType<typeof sanitizeUser>> {
  const updateData: Record<string, string> = {};
  if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
  if (updates.email !== undefined) updateData.email = updates.email;

  const user = await User.findOneAndUpdate(
    { _id: studentId, userType: 'student' },
    updateData,
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new AppError('Student not found', 404);
  }
  return sanitizeUser(user);
}

export async function deleteStudent(studentId: string): Promise<void> {
  const result = await User.findOneAndDelete({ _id: studentId, userType: 'student' });
  if (!result) {
    throw new AppError('Student not found', 404);
  }
}
