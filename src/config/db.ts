import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(uri: string): Promise<void> {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.db?.databaseName}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      isConnected = false;
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', (err as Error).message);
    throw err;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected;
}
