import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default postgres DB to create our database
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Create database if not exists
    await pool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created successfully`);

    // Connect to the new database
    pool.end();
    const newPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create users table
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'teacher', 'guest')),
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create levels table
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id SERIAL PRIMARY KEY,
        level_number INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Levels table created');

    // Create exercises table
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        level_id INT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
        exercise_type VARCHAR(50) NOT NULL CHECK (exercise_type IN ('multiple_choice', 'drag_drop', 'matching', 'selection', 'coloring')),
        title VARCHAR(200) NOT NULL,
        question_text TEXT,
        image_url VARCHAR(255),
        hint TEXT,
        instructions TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Exercises table created');

    // Create user_progress table
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        level_id INT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
        score INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level_id)
      )
    `);
    console.log('✅ User progress table created');

    // Create exercise_results table
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS exercise_results (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exercise_id INT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        level_id INT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
        score INT DEFAULT 0,
        attempts INT DEFAULT 1,
        user_answer JSONB,
        is_correct BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Exercise results table created');

    // Create diagnosis_results table
    await newPool.query(`
      CREATE TABLE IF NOT EXISTS diagnosis_results (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        diagnosis_group INT,
        score INT DEFAULT 0,
        recommended_level INT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Diagnosis results table created');

    // Create indexes
    await newPool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_exercise_results_user_id ON exercise_results(user_id);
      CREATE INDEX IF NOT EXISTS idx_exercises_level_id ON exercises(level_id);
    `);
    console.log('✅ Indexes created');

    // Insert default levels
    await newPool.query(`
      INSERT INTO levels (level_number, title, description) VALUES
      (1, 'المستوى الأول', 'أسئلة أساسية لتحديد المستوى'),
      (2, 'المستوى الثاني', 'مستوى متوسط'),
      (3, 'المستوى الثالث', 'مستوى متقدم'),
      (4, 'المستوى الرابع', 'مستوى صعب')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Default levels inserted');

    console.log('\n🎉 Database setup completed successfully!');
    await newPool.end();

  } catch (err) {
    if (err.code === '42P04') {
      console.log('⚠️  Database already exists');
    } else {
      console.error('❌ Error setting up database:', err);
    }
    process.exit(0);
  }
}

setupDatabase();
