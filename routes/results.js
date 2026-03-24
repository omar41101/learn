import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Submit exercise result
router.post('/submit', async (req, res) => {
  const { user_id, exercise_id, level_id, score, is_correct, user_answer } = req.body;

  try {
    // Validate required fields
    if (!user_id || !exercise_id || !level_id) {
      console.error('❌ Missing required fields:', { user_id, exercise_id, level_id });
      return res.status(400).json({ error: 'Missing required fields: user_id, exercise_id, or level_id' });
    }

    // Convert to integers
    const userId = parseInt(user_id, 10);
    const exerciseId = parseInt(exercise_id, 10);
    const levelId = parseInt(level_id, 10);

    if (isNaN(userId) || isNaN(exerciseId) || isNaN(levelId)) {
      console.error('❌ Invalid ID format:', { user_id, exercise_id, level_id });
      return res.status(400).json({ error: 'Invalid ID format - must be integers' });
    }

    // Get previous attempts for this user+exercise
    const [existing] = await pool.execute(
      'SELECT attempts, is_correct FROM exercise_results WHERE user_id = ? AND exercise_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId, exerciseId]
    );

    const attempts = existing && existing.length > 0 ? existing[0].attempts + 1 : 1;

    // Check if the user has already completed this exercise correctly before
    const [previousCorrect] = await pool.execute(
      'SELECT id FROM exercise_results WHERE user_id = ? AND exercise_id = ? AND is_correct = 1 LIMIT 1',
      [userId, exerciseId]
    );

    // If already completed correctly before, save with score=0 to prevent duplicate points
    const awardedScore = (previousCorrect && previousCorrect.length > 0) ? 0 : (score || 0);

    // Insert the new result
    const [result] = await pool.execute(
      'INSERT INTO exercise_results (user_id, exercise_id, level_id, score, attempts, is_correct, user_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, exerciseId, levelId, awardedScore, attempts, is_correct || false, JSON.stringify(user_answer)]
    );

    // Fetch and return the inserted result
    const [resultData] = await pool.execute('SELECT * FROM exercise_results WHERE id = ?', [result.insertId]);
    res.status(201).json(resultData[0]);
  } catch (err) {
    console.error('❌ Error submitting result:', err.message, err.code);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// Get user's exercise results
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const [results] = await pool.execute(
      'SELECT * FROM exercise_results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting user results:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get results for specific level
router.get('/user/:userId/level/:levelId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const levelId = parseInt(req.params.levelId, 10);
    const [results] = await pool.execute(
      'SELECT * FROM exercise_results WHERE user_id = ? AND level_id = ? ORDER BY created_at DESC',
      [userId, levelId]
    );
    res.json(results);
  } catch (err) {
    console.error('❌ Error getting level results:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Submit diagnosis summary (score + timing → recommended_level)
router.post('/diagnosis/submit', async (req, res) => {
  const {
    user_id,
    diagnosis_group,
    score,
    total_time_seconds,   // optional: total time spent on diagnosis
    avg_time_per_question // optional: average time per question
  } = req.body;

  try {
    const userId = parseInt(user_id, 10);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid or missing user_id' });
    }

    const numericScore = typeof score === 'number' ? score : parseInt(score || 0, 10) || 0;
    const totalTime = typeof total_time_seconds === 'number'
      ? total_time_seconds
      : parseInt(total_time_seconds || 0, 10) || 0;
    const avgTime = typeof avg_time_per_question === 'number'
      ? avg_time_per_question
      : parseFloat(avg_time_per_question || 0) || 0;

    // --- Simple heuristic to compute recommended_level based on score + time ---
    // Assumptions:
    // - score is out of 40 (4 questions × 10 points) – adjust easily if needed
    // - faster + higher score → higher level
    let recommended_level = 1;

    if (numericScore >= 35) {
      // Very strong score
      if (avgTime && avgTime <= 20) {
        recommended_level = 4; // fast and correct
      } else {
        recommended_level = 3;
      }
    } else if (numericScore >= 25) {
      // Good score
      if (avgTime && avgTime <= 25) {
        recommended_level = 3;
      } else {
        recommended_level = 2;
      }
    } else if (numericScore >= 15) {
      // Medium score
      recommended_level = 2;
    } else {
      // Low score
      recommended_level = 1;
    }

    // Clamp between 1 and 4
    if (recommended_level < 1) recommended_level = 1;
    if (recommended_level > 4) recommended_level = 4;

    const [result] = await pool.execute(
      'INSERT INTO diagnosis_results (user_id, diagnosis_group, score, total_time_seconds, avg_time_per_question, recommended_level) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, diagnosis_group || 1, numericScore, totalTime, avgTime, recommended_level]
    );
    
    const [diagnosisData] = await pool.execute('SELECT * FROM diagnosis_results WHERE id = ?', [result.insertId]);
    res.status(201).json(diagnosisData[0]);
  } catch (err) {
    console.error('❌ Error submitting diagnosis:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get student's diagnosis results
router.get('/diagnosis/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const [results] = await pool.execute(
      'SELECT * FROM diagnosis_results WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1',
      [userId]
    );

    if (results.length === 0) {
      return res.json({ message: 'No diagnosis results' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('❌ Error getting diagnosis results:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get statistics for teacher
router.get('/statistics/all', async (req, res) => {
  try {
    const [totalStudentsResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE user_type = ?', ['student']);
    
    const [avgScoreResult] = await pool.execute(
      'SELECT AVG(score) as avg_score FROM exercise_results'
    );

    const [completionRateResult] = await pool.execute(
      'SELECT COUNT(DISTINCT user_id) as completed_users FROM exercise_results WHERE is_correct = true'
    );

    res.json({
      totalStudents: totalStudentsResult[0].count,
      averageScore: avgScoreResult[0].avg_score || 0,
      completedExercises: completionRateResult[0].completed_users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
