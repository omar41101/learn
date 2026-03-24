import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get user progress for a level
router.get('/user/:userId/level/:levelId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const levelId = parseInt(req.params.levelId, 10);
    
    const [progress] = await pool.execute(
      'SELECT * FROM user_progress WHERE user_id = ? AND level_id = ?',
      [userId, levelId]
    );

    if (progress.length === 0) {
      // Create new progress record if doesn't exist
      const [result] = await pool.execute(
        'INSERT INTO user_progress (user_id, level_id, score) VALUES (?, ?, 0)',
        [userId, levelId]
      );
      const [newProgress] = await pool.execute('SELECT * FROM user_progress WHERE id = ?', [result.insertId]);
      return res.json(newProgress[0]);
    }

    res.json(progress[0]);
  } catch (err) {
    console.error('❌ Error getting progress:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all user progress (now aggregated from exercise results)
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }
    
    // ✅ FIX: Get progress by aggregating exercise_results by level
    const [results] = await pool.execute(
      `SELECT 
        level_id,
        COUNT(*) as exercise_count,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
        SUM(score) as score,
        MAX(created_at) as last_completed
      FROM exercise_results 
      WHERE user_id = ? 
      GROUP BY level_id 
      ORDER BY level_id`,
      [userId]
    );
    
    console.log('📊 Loaded progress for user', userId, ':', results);
    
    // Transform to match expected format (add completed flag based on any correct answer)
    const progressData = results.map(row => ({
      user_id: userId,
      level_id: row.level_id,
      score: row.score || 0,
      completed: row.correct_count > 0,
      exercise_count: row.exercise_count,
      correct_count: row.correct_count,
      last_completed: row.last_completed
    }));
    
    res.json(progressData);
  } catch (err) {
    console.error('❌ Error getting all progress:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update progress
router.put('/user/:userId/level/:levelId', async (req, res) => {
  const { score, completed } = req.body;

  try {
    const userId = parseInt(req.params.userId, 10);
    const levelId = parseInt(req.params.levelId, 10);
    
    await pool.execute(
      'UPDATE user_progress SET score = ?, completed = ? WHERE user_id = ? AND level_id = ?',
      [score, completed || false, userId, levelId]
    );

    const [progress] = await pool.execute(
      'SELECT * FROM user_progress WHERE user_id = ? AND level_id = ?',
      [userId, levelId]
    );

    res.json({ message: 'Progress updated successfully', progress: progress[0] });
  } catch (err) {
    console.error('❌ Error updating progress:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark level as completed
router.post('/user/:userId/level/:levelId/complete', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const levelId = parseInt(req.params.levelId, 10);
    
    await pool.execute(
      'UPDATE user_progress SET completed = true, completed_at = NOW() WHERE user_id = ? AND level_id = ?',
      [userId, levelId]
    );

    const [progress] = await pool.execute(
      'SELECT * FROM user_progress WHERE user_id = ? AND level_id = ?',
      [userId, levelId]
    );

    res.json({ message: 'Level completed', progress: progress[0] });
  } catch (err) {
    console.error('❌ Error completing level:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get total score for user
router.get('/user/:userId/total-score', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const [result] = await pool.execute(
      'SELECT SUM(score) as total_score FROM user_progress WHERE user_id = ?',
      [userId]
    );
    res.json({ totalScore: result[0].total_score || 0 });
  } catch (err) {
    console.error('❌ Error getting total score:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
