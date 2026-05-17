import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { Level } from './models/Level.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.resolve(__dirname, '..')));

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔧 Checking database integrity...');
    const count = await Level.countDocuments();
    if (count === 0) {
      console.log('📊 Inserting default levels...');
      await Level.insertMany([
        { levelNumber: 1, title: 'المستوى الأول', description: 'أسئلة أساسية لتحديد المستوى' },
        { levelNumber: 2, title: 'المستوى الثاني', description: 'مستوى متوسط' },
        { levelNumber: 3, title: 'المستوى الثالث', description: 'مستوى متقدم' },
        { levelNumber: 4, title: 'المستوى الرابع', description: 'مستوى صعب' },
      ]);
      console.log('✅ Default levels inserted');
    } else {
      console.log(`✅ Database has ${count} levels`);
    }
    console.log('📄 Exercises are stored in exercises.json file (not in database)');
  } catch (err) {
    console.error('⚠️ Database initialization warning:', (err as Error).message);
  }
}

async function start(): Promise<void> {
  try {
    await connectDB(env.MONGODB_URI);
    console.log(`📊 Database: ${env.MONGODB_URI}`);

    await initializeDatabase();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', (err as Error).message);
    process.exit(1);
  }
}

start();
