import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService.js';

function asTrimmedString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function pickFirst(body: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
}

function getBody(req: Request): Record<string, unknown> {
  if (req.body && typeof req.body === 'object') return req.body as Record<string, unknown>;
  return {};
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = getBody(req);

    const username = asTrimmedString(pickFirst(body, ['username']));
    const email = asTrimmedString(pickFirst(body, ['email'])).toLowerCase();
    const password = asTrimmedString(pickFirst(body, ['password']));
    const userTypeRaw = asTrimmedString(pickFirst(body, ['userType', 'user_type', 'role']));
    const userType = (userTypeRaw === 'teacher' || userTypeRaw === 'student') ? userTypeRaw : 'student';
    const fullName = asTrimmedString(pickFirst(body, ['fullName', 'full_name', 'name'])) || '';

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const result = await userService.registerUser(username, email, password, userType, fullName);
    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function quickRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = getBody(req);
    const fullName = asTrimmedString(pickFirst(body, ['fullName', 'full_name', 'name']));

    if (!fullName) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const result = await userService.quickRegisterUser(fullName);
    res.status(201).json({
      message: 'Student registered successfully',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = getBody(req);
    const username = asTrimmedString(pickFirst(body, ['username', 'email']));
    const password = asTrimmedString(pickFirst(body, ['password']));
    const role = asTrimmedString(pickFirst(body, ['role', 'userType', 'user_type']));

    if (!username) {
      res.status(400).json({ error: 'Username or email is required' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const result = await userService.loginUser(username, password, role);
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'Logged out successfully' });
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;
    const user = await userService.getUserProfile(userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string;

    const body = getBody(req);
    const updates: { fullName?: string; email?: string } = {};
    const fullName = asTrimmedString(pickFirst(body, ['fullName', 'full_name']));
    const email = asTrimmedString(pickFirst(body, ['email'])).toLowerCase();
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;

    const user = await userService.updateUserProfile(userId, updates);
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    next(err);
  }
}

export async function getAllStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const students = await userService.getAllStudents();
    res.json(students);
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = getBody(req);
    const username = asTrimmedString(pickFirst(body, ['username']));
    const email = asTrimmedString(pickFirst(body, ['email'])).toLowerCase();
    const password = asTrimmedString(pickFirst(body, ['password']));
    const fullName = asTrimmedString(pickFirst(body, ['fullName', 'full_name', 'name'])) || '';

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const user = await userService.createStudent({ username, email, password, fullName });
    res.status(201).json({ message: 'Student created successfully', user });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.params.studentId as string;

    const body = getBody(req);
    const updates: { fullName?: string; email?: string } = {};
    const fullName = asTrimmedString(pickFirst(body, ['fullName', 'full_name']));
    const email = asTrimmedString(pickFirst(body, ['email'])).toLowerCase();
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;

    const user = await userService.updateStudent(studentId, updates);
    res.json({ message: 'Student updated successfully', user });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.params.studentId as string;
    await userService.deleteStudent(studentId);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
}
