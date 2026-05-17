import dotenv from 'dotenv';
dotenv.config();

export interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  NODE_ENV: string;
  CLIENT_URL: string;
}

function loadEnv(): EnvConfig {
  const missing: string[] = [];
  const get = (key: string, fallback?: string): string => {
    const val = process.env[key] || fallback;
    if (!val) missing.push(key);
    return val ?? '';
  };

  const config: EnvConfig = {
    PORT: parseInt(get('PORT', '3000'), 10),
    MONGODB_URI: get('MONGODB_URI', 'mongodb://localhost:27017/flas_learning'),
    JWT_SECRET: get('JWT_SECRET', 'change_me_in_production'),
    GEMINI_API_KEY: get('GEMINI_API_KEY', ''),
    NODE_ENV: get('NODE_ENV', 'development'),
    CLIENT_URL: get('CLIENT_URL', 'http://localhost:3000'),
  };

  if (missing.length > 0 && config.NODE_ENV === 'production') {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
  return config;
}

export const env = loadEnv();
