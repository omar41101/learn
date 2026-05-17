import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import { Level } from './models/Level.js';

async function seed(): Promise<void> {
  try {
    await connectDB(env.MONGODB_URI);
    console.log('🌱 Seeding database...');

    await Level.deleteMany({});
    await Level.insertMany([
      { levelNumber: 1, title: 'المستوى الأول', description: 'أسئلة أساسية لتحديد المستوى' },
      { levelNumber: 2, title: 'المستوى الثاني', description: 'مستوى متوسط' },
      { levelNumber: 3, title: 'المستوى الثالث', description: 'مستوى متقدم' },
      { levelNumber: 4, title: 'المستوى الرابع', description: 'مستوى صعب' },
    ]);
    console.log('✅ Levels seeded');

    const teacherExists = await User.findOne({ userType: 'teacher' });
    if (!teacherExists) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        userType: 'teacher',
        fullName: 'المدير',
      });
      console.log('✅ Default teacher created (admin / admin123)');
    }

    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', (err as Error).message);
    process.exit(1);
  }
}

seed();
