
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();


// Logout user (client-side only, just clears token)
router.post('/logout', (req, res) => {
  // Instruct client to remove token (stateless JWT)
  res.json({ message: 'Logged out successfully' });
});


// Register user
router.post('/register', async (req, res) => {
  const { username, email, password, user_type, full_name } = req.body;

  try {
    // Check if user exists (MySQL uses ? for placeholders)
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (MySQL: no RETURNING, get insertId)
    const [insertResult] = await pool.execute(
      'INSERT INTO users (username, email, password, user_type, full_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, user_type || 'student', full_name]
    );

    // Fetch the inserted user
    const [userRows] = await pool.execute('SELECT id, username, email, user_type FROM users WHERE id = ?', [insertResult.insertId]);
    const user = userRows[0];

    const token = jwt.sign({ userId: user.id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick Register for students (name only)
router.post('/quick-register', async (req, res) => {
  const { full_name } = req.body;

  if (!full_name || full_name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const timestamp = Date.now();
    const username = `student_${timestamp}`;
    const email = `${username}@example.com`; // Dummy email
    // Dummy password (won't be used for login)
    const hashedPassword = await bcrypt.hash(username, 10);

    // Insert user
    const [insertResult] = await pool.execute(
      'INSERT INTO users (username, email, password, user_type, full_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, 'student', full_name.trim()]
    );

    // Fetch the inserted user
    const [userRows] = await pool.execute('SELECT id, username, user_type, full_name FROM users WHERE id = ?', [insertResult.insertId]);
    const user = userRows[0];

    // No need for JWT here as auth is bypassed for this flow, but return it just in case
    const token = jwt.sign({ userId: user.id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Student registered successfully',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        user_type: user.user_type
      },
      token,
    });
  } catch (err) {
    console.error('❌ Error in quick-register:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Allow login by username OR email
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Check if user_type matches selected role
    if (role && user.user_type !== role) {
      return res.status(403).json({ error: 'نوع الحساب غير مطابق للدور المختار' });
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type,
        full_name: user.full_name,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const [users] = await pool.execute('SELECT id, username, email, user_type, full_name, created_at FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('❌ Error getting user profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  const { full_name, email } = req.body;

  try {
    const userId = parseInt(req.params.userId, 10);
    await pool.execute(
      'UPDATE users SET full_name = ?, email = ? WHERE id = ?',
      [full_name, email, userId]
    );

    const [users] = await pool.execute('SELECT id, username, email, user_type, full_name FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: users[0] });
  } catch (err) {
    console.error('❌ Error updating user profile:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all students (for teacher)
router.get('/students/all', async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT id, username, email, full_name, created_at FROM users WHERE user_type = ? ORDER BY created_at DESC', ['student']);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new student (teacher only)
router.post('/students/create', async (req, res) => {
  const { username, email, password, full_name } = req.body;

  try {
    // Check if user exists
    const [existingUser] = await pool.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert student
    const [insertResult] = await pool.execute(
      'INSERT INTO users (username, email, password, user_type, full_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, 'student', full_name]
    );

    // Fetch the inserted student
    const [userRows] = await pool.execute('SELECT id, username, email, user_type, full_name FROM users WHERE id = ?', [insertResult.insertId]);
    
    res.status(201).json({
      message: 'Student created successfully',
      user: userRows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student (teacher only)
router.put('/students/:studentId', async (req, res) => {
  const { full_name, email } = req.body;

  try {
    await pool.execute(
      'UPDATE users SET full_name = ?, email = ? WHERE id = ? AND user_type = ?',
      [full_name, email, req.params.studentId, 'student']
    );

    const [users] = await pool.execute('SELECT id, username, email, user_type, full_name FROM users WHERE id = ?', [req.params.studentId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully', user: users[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student (teacher only)
router.delete('/students/:studentId', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ? AND user_type = ?', [req.params.studentId, 'student']);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
