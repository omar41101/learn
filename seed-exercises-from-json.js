import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seedExercisesFromJSON() {
  try {
    console.log('🔧 Reading exercises from exercises.json...\n');

    // Read exercises.json
    const exercisesPath = path.join(__dirname, 'exercises.json');
    const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

    // Combine diagnosis and level exercises
    const allExercises = [
      ...exercisesData.diagnosis.map(ex => ({ ...ex, is_diagnosis: 1 })),
      ...exercisesData.levels.map(ex => ({ ...ex, is_diagnosis: 0 }))
    ];

    console.log(`📊 Found ${allExercises.length} exercises total`);

    // 1. Ensure the is_diagnosis column exists (idempotent migration)
    try {
      await pool.execute(
        'ALTER TABLE exercises ADD COLUMN is_diagnosis TINYINT(1) NOT NULL DEFAULT 0'
      );
      console.log('✅ Added is_diagnosis column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  is_diagnosis column already exists - skipping ALTER TABLE');
      } else {
        throw e;
      }
    }

    // 2. Clear all existing exercises and reset auto increment
    try {
      await pool.execute('TRUNCATE TABLE exercises');
      console.log('🗑️  Cleared all existing exercises');
    } catch (e) {
      // If TRUNCATE fails, try DELETE + ALTER
      await pool.execute('DELETE FROM exercises');
      console.log('🗑️  Cleared all existing exercises');
      await pool.execute('ALTER TABLE exercises AUTO_INCREMENT = 1');
    }

    // 3. Insert all exercises (let DB generate IDs automatically)

    // 4. Insert all exercises
    console.log('📝 Inserting exercises from exercises.json...');
    let diagnosisCount = 0;
    let levelCount = 0;

    for (const exercise of allExercises) {
      try {
        await pool.execute(
          `INSERT INTO exercises (level_id, exercise_type, title, question_text, hint, data, is_diagnosis)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            exercise.level_id,
            exercise.exercise_type,
            exercise.title,
            exercise.question_text,
            exercise.hint || '',
            JSON.stringify(exercise.data || {}),
            exercise.is_diagnosis
          ]
        );

        if (exercise.is_diagnosis) {
          diagnosisCount++;
        } else {
          levelCount++;
        }
      } catch (err) {
        console.error(`❌ Error inserting exercise "${exercise.title}":`, err.message);
      }
    }

    console.log(`✅ Diagnosis exercises seeded: ${diagnosisCount}`);
    console.log(`✅ Level exercises seeded: ${levelCount}`);
    console.log(`\n🎉 Total exercises seeded: ${diagnosisCount + levelCount}`);
    console.log('✨ Exercises table is now synchronized with exercises.json');

    // 5. Verify insertion
    const [result] = await pool.execute('SELECT COUNT(*) as count FROM exercises');
    console.log(`\n📊 Database verification: ${result[0].count} exercises in database`);

  } catch (err) {
    console.error('❌ Error seeding exercises:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seed
seedExercisesFromJSON();
