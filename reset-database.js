import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default postgres DB
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function resetDatabase() {
  try {
    console.log('⚠️  WARNING: This will delete all data from the database!');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('');
    console.log('Attempting to reset...');
    console.log('');

    // Terminate all connections
    await pool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `, [process.env.DB_NAME]);

    // Drop database
    await pool.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' dropped`);

    pool.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error resetting database:', err);
    process.exit(1);
  }
}

resetDatabase();
