import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Load exercises from JSON file
function loadExercises() {
  try {
    const filePath = path.join(__dirname, '../exercises.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading exercises.json:', err.message);
    return { diagnosis: [], levels: [] };
  }
}

// Get all exercises for a level
// Query param: ?diagnosis=true  → return only diagnosis exercises
//              (omitted / false) → return only regular exercises
router.get('/level/:levelId', async (req, res) => {
  try {
    const isDiagnosis = req.query.diagnosis === 'true';
    const exercisesData = loadExercises();
    const exercisesList = isDiagnosis ? exercisesData.diagnosis : exercisesData.levels;
    
    const levelId = parseInt(req.params.levelId);
    const exercises = exercisesList.filter(ex => ex.level_id === levelId);
    
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single exercise
router.get('/:exerciseId', async (req, res) => {
  try {
    const exercisesData = loadExercises();
    const allExercises = [...exercisesData.diagnosis, ...exercisesData.levels];
    
    const exerciseId = parseInt(req.params.exerciseId);
    const exercise = allExercises.find(ex => ex.id === exerciseId);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new exercise (add to JSON file) - teacher only
router.post('/', async (req, res) => {
  const { level_id, exercise_type, title, question_text, hint, data, is_diagnosis } = req.body;

  try {
    console.log('Creating exercise:', { level_id, exercise_type, title, question_text });
    
    const exercisesData = loadExercises();
    const allExercises = [...exercisesData.diagnosis, ...exercisesData.levels];
    
    // Generate new ID (find max ID + 1)
    const newId = Math.max(...allExercises.map(ex => ex.id), 0) + 1;
    
    const newExercise = {
      id: newId,
      level_id,
      title,
      exercise_type,
      question_text,
      hint: hint || '',
      data: data || {}
    };
    
    // Add to appropriate array
    if (is_diagnosis) {
      exercisesData.diagnosis.push(newExercise);
    } else {
      exercisesData.levels.push(newExercise);
    }
    
    // Save to file
    const filePath = path.join(__dirname, '../exercises.json');
    fs.writeFileSync(filePath, JSON.stringify(exercisesData, null, 2), 'utf8');
    
    console.log('Exercise created with ID:', newId);
    res.status(201).json(newExercise);
  } catch (err) {
    console.error('Error creating exercise:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update exercise (teacher only)
router.put('/:exerciseId', async (req, res) => {
  const { title, question_text, hint, data } = req.body;

  try {
    const exercisesData = loadExercises();
    const exerciseId = parseInt(req.params.exerciseId);
    
    // Find exercise in either array
    let exercise = exercisesData.diagnosis.find(ex => ex.id === exerciseId);
    let isDiagnosis = true;
    
    if (!exercise) {
      exercise = exercisesData.levels.find(ex => ex.id === exerciseId);
      isDiagnosis = false;
    }
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Update exercise
    exercise.title = title || exercise.title;
    exercise.question_text = question_text || exercise.question_text;
    exercise.hint = hint !== undefined ? hint : exercise.hint;
    exercise.data = data || exercise.data;
    
    // Save to file
    const filePath = path.join(__dirname, '../exercises.json');
    fs.writeFileSync(filePath, JSON.stringify(exercisesData, null, 2), 'utf8');
    
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete exercise (teacher only)
router.delete('/:exerciseId', async (req, res) => {
  try {
    const exercisesData = loadExercises();
    const exerciseId = parseInt(req.params.exerciseId);
    
    const diagnosisIndex = exercisesData.diagnosis.findIndex(ex => ex.id === exerciseId);
    if (diagnosisIndex !== -1) {
      exercisesData.diagnosis.splice(diagnosisIndex, 1);
    } else {
      const levelIndex = exercisesData.levels.findIndex(ex => ex.id === exerciseId);
      if (levelIndex !== -1) {
        exercisesData.levels.splice(levelIndex, 1);
      } else {
        return res.status(404).json({ error: 'Exercise not found' });
      }
    }
    
    // Save to file
    const filePath = path.join(__dirname, '../exercises.json');
    fs.writeFileSync(filePath, JSON.stringify(exercisesData, null, 2), 'utf8');
    
    res.json({ message: 'Exercise deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
