import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

async function fullReset() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'flas_learning'
  };

  try {
    console.log('🛑 Starting FULL DATABASE RESET...');
    console.log(`Target Database: ${dbConfig.database}`);

    const connection = await mysql.createConnection(dbConfig);

    // 1. Disable Foreign Key Checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks disabled');

    // 2. Truncate all tables
    const tables = [
      'exercise_results',
      'diagnosis_results',
      'user_progress',
      'exercises',
      'users',
      'levels'
    ];

    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE \`${table}\``);
        console.log(`🗑️  Truncated table: ${table}`);
      } catch (err) {
        console.warn(`⚠️ Could not truncate ${table}: ${err.message}`);
      }
    }

    // 3. Enable Foreign Key Checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks re-enabled');

    await connection.end();

    console.log('\n🏗️  Running setup to recreate levels...');
    execSync('node setup-mysql.js', { stdio: 'inherit' });

    console.log('\n🌱 Seeding exercises from JSON...');
    execSync('node seed-exercises-from-json.js', { stdio: 'inherit' });

    console.log('\n✨ FULL RESET COMPLETED SUCCESSFULLY! ✨');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ CRITICAL ERROR during reset:', err.message);
    process.exit(1);
  }
}

fullReset();
