import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    console.log('🚀 Starting migration: Adding timing columns to diagnosis_results (MySQL)...');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'flas_learning',
    });

    // Check if total_time_seconds exists
    const [columns] = await connection.query('SHOW COLUMNS FROM diagnosis_results');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('total_time_seconds')) {
      await connection.query('ALTER TABLE diagnosis_results ADD COLUMN total_time_seconds INT DEFAULT 0 AFTER score');
      console.log('✅ Column total_time_seconds added.');
    } else {
      console.log('ℹ️ Column total_time_seconds already exists.');
    }

    if (!columnNames.includes('avg_time_per_question')) {
      await connection.query('ALTER TABLE diagnosis_results ADD COLUMN avg_time_per_question FLOAT DEFAULT 0 AFTER total_time_seconds');
      console.log('✅ Column avg_time_per_question added.');
    } else {
      console.log('ℹ️ Column avg_time_per_question already exists.');
    }

    await connection.end();
    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  }
}

migrate();
