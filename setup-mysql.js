import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up MySQL database...');

    // Create connection to MySQL server (without specifying database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
    });

    const dbName = process.env.DB_NAME || 'flas_learning';

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created or already exists`);

    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        user_type VARCHAR(20) NOT NULL DEFAULT 'student',
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_user_type (user_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created');

    // Create levels table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level_number INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_level_number (level_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Levels table created');

    // Create exercises table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level_id INT NOT NULL,
        exercise_type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        question_text LONGTEXT,
        image_url VARCHAR(255),
        hint TEXT,
        instructions TEXT,
        data JSON,
        is_diagnosis TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_level_id (level_id),
        KEY idx_exercise_type (exercise_type),
        KEY idx_is_diagnosis (is_diagnosis),
        FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Exercises table created');

    // Create user_progress table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        level_id INT NOT NULL,
        score INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_level (user_id, level_id),
        KEY idx_user_id (user_id),
        KEY idx_level_id (level_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ User progress table created');

    // Create exercise_results table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercise_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        exercise_id INT NOT NULL,
        level_id INT NOT NULL,
        score INT DEFAULT 0,
        attempts INT DEFAULT 1,
        user_answer JSON,
        is_correct BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        KEY idx_exercise_id (exercise_id),
        KEY idx_level_id (level_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Exercise results table created');

    // Create diagnosis_results table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS diagnosis_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        diagnosis_group INT,
        score INT DEFAULT 0,
        recommended_level INT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Diagnosis results table created');

    // Insert default levels (if not exists)
    await connection.query(`
      INSERT IGNORE INTO levels (level_number, title, description) VALUES
      (1, 'المستوى الأول', 'أسئلة أساسية لتحديد المستوى'),
      (2, 'المستوى الثاني', 'مستوى متوسط'),
      (3, 'المستوى الثالث', 'مستوى متقدم'),
      (4, 'المستوى الرابع', 'مستوى صعب')
    `);
    console.log('✅ Default levels inserted');

    console.log('\n🎉 MySQL Database setup completed successfully!');
    await connection.end();

  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
    process.exit(1);
  }
}

setupDatabase();
