import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    console.log('🚀 Starting migration: Adding timing columns to diagnosis_results...');

    // Add total_time_seconds if it doesn't exist
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_results' AND column_name='total_time_seconds') THEN
          ALTER TABLE diagnosis_results ADD COLUMN total_time_seconds INT DEFAULT 0;
          RAISE NOTICE 'Column total_time_seconds added.';
        ELSE
          RAISE NOTICE 'Column total_time_seconds already exists.';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='diagnosis_results' AND column_name='avg_time_per_question') THEN
          ALTER TABLE diagnosis_results ADD COLUMN avg_time_per_question FLOAT DEFAULT 0;
          RAISE NOTICE 'Column avg_time_per_question added.';
        ELSE
          RAISE NOTICE 'Column avg_time_per_question already exists.';
        END IF;
      END $$;
    `);

    console.log('✅ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
