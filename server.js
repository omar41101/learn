import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

// Import routes
import userRoutes from './routes/users.js';
import exerciseRoutes from './routes/exercises.js';
import progressRoutes from './routes/progress.js';
import resultsRoutes from './routes/results.js';
import aiRoutes from './routes/ai.js';

dotenv.config();
// AI Routes integration enabled

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/ai', aiRoutes);

// Initialize database tables and levels on startup
async function initializeDatabase() {
  try {
    console.log('🔧 Checking database integrity...');
    
    // Check if levels table has data
    const [levels] = await pool.execute('SELECT COUNT(*) as count FROM levels');
    
    if (levels[0].count === 0) {
      console.log('📊 Inserting default levels...');
      await pool.execute(`
        INSERT INTO levels (level_number, title, description) VALUES
        (1, 'المستوى الأول', 'أسئلة أساسية لتحديد المستوى'),
        (2, 'المستوى الثاني', 'مستوى متوسط'),
        (3, 'المستوى الثالث', 'مستوى متقدم'),
        (4, 'المستوى الرابع', 'مستوى صعب')
      `);
      console.log('✅ Default levels inserted');
    } else {
      console.log(`✅ Database has ${levels[0].count} levels`);
    }
    
    console.log('📄 Exercises are stored in exercises.json file (not in database)');
  } catch (err) {
    console.error('⚠️ Database initialization warning:', err.message);
  }
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await pool.execute('SELECT NOW() as time');
    res.json({ status: 'ok', database: 'connected', time: result[0].time });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Serve static pages
import path from 'path';
// ...existing code...

app.get('/', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), '../index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  
  // Check DB connection at startup
  try {
    const [result] = await pool.execute('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Initialize database if needed
    await initializeDatabase();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('⚠️ Make sure MySQL is running and .env is configured correctly');
  }
});
