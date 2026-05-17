import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ExerciseFile, ExerciseEntry } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXERCISES_PATH = path.join(__dirname, '../../exercises.json');

async function loadExercises(): Promise<ExerciseFile> {
  try {
    const data = await fs.readFile(EXERCISES_PATH, 'utf8');
    return JSON.parse(data) as ExerciseFile;
  } catch {
    return { diagnosis: [], levels: [] };
  }
}

async function saveExercises(data: ExerciseFile): Promise<void> {
  await fs.writeFile(EXERCISES_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function getExercisesForLevel(
  levelId: number,
  isDiagnosis = false
): Promise<ExerciseEntry[]> {
  const data = await loadExercises();
  const list = isDiagnosis ? data.diagnosis : data.levels;
  return list.filter((ex) => ex.level_id === levelId);
}

export async function getExerciseById(exerciseId: number): Promise<ExerciseEntry> {
  const data = await loadExercises();
  const all = [...data.diagnosis, ...data.levels];
  const exercise = all.find((ex) => ex.id === exerciseId);
  if (!exercise) {
    throw Object.assign(new Error('Exercise not found'), { statusCode: 404 });
  }
  return exercise;
}

export async function createExercise(input: {
  level_id: number;
  exercise_type: string;
  title?: string;
  question_text: string;
  hint?: string;
  data?: Record<string, unknown>;
  is_diagnosis?: boolean;
}): Promise<ExerciseEntry> {
  const data = await loadExercises();
  const all = [...data.diagnosis, ...data.levels];
  const newId = Math.max(...all.map((ex) => ex.id), 0) + 1;

  const exercise: ExerciseEntry = {
    id: newId,
    level_id: input.level_id,
    title: input.title || `Exercise ${newId}`,
    exercise_type: input.exercise_type,
    question_text: input.question_text,
    hint: input.hint || '',
    data: input.data || {},
  };

  if (input.is_diagnosis) {
    data.diagnosis.push(exercise);
  } else {
    data.levels.push(exercise);
  }

  await saveExercises(data);
  return exercise;
}

export async function updateExercise(
  exerciseId: number,
  updates: {
    title?: string;
    question_text?: string;
    hint?: string;
    instructions?: string;
    image_url?: string | null;
    data?: Record<string, unknown>;
  }
): Promise<ExerciseEntry> {
  const exercisesData = await loadExercises();

  let exercise = exercisesData.diagnosis.find((ex) => ex.id === exerciseId);
  let isDiagnosis = true;

  if (!exercise) {
    exercise = exercisesData.levels.find((ex) => ex.id === exerciseId);
    isDiagnosis = false;
  }

  if (!exercise) {
    throw Object.assign(new Error('Exercise not found'), { statusCode: 404 });
  }

  if (updates.title !== undefined) exercise.title = updates.title;
  if (updates.question_text !== undefined) exercise.question_text = updates.question_text;
  if (updates.hint !== undefined) exercise.hint = updates.hint;
  if (updates.instructions !== undefined) (exercise as any).instructions = updates.instructions;
  if (updates.image_url !== undefined) (exercise as any).image_url = updates.image_url;
  if (updates.data !== undefined) exercise.data = updates.data;

  await saveExercises(exercisesData);
  return exercise;
}

export async function deleteExercise(exerciseId: number): Promise<void> {
  const exercisesData = await loadExercises();

  const diagIdx = exercisesData.diagnosis.findIndex((ex) => ex.id === exerciseId);
  if (diagIdx !== -1) {
    exercisesData.diagnosis.splice(diagIdx, 1);
  } else {
    const levelIdx = exercisesData.levels.findIndex((ex) => ex.id === exerciseId);
    if (levelIdx === -1) {
      throw Object.assign(new Error('Exercise not found'), { statusCode: 404 });
    }
    exercisesData.levels.splice(levelIdx, 1);
  }

  await saveExercises(exercisesData);
}
