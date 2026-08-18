import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET', 'dev_secret_change_me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  jwtResetExpiresIn: process.env.JWT_RESET_EXPIRES_IN ?? '1h',
  supabaseUrl: requireEnv('SUPABASE_URL', 'https://placeholder.supabase.co'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY', 'placeholder_anon_key'),
  supabaseBucket: process.env.SUPABASE_BUCKET ?? 'exercise-media',
  mailtrapHost: requireEnv('MAILTRAP_HOST', 'sandbox.smtp.mailtrap.io'),
  mailtrapPort: parseInt(process.env.MAILTRAP_PORT ?? '2525', 10),
  mailtrapUser: requireEnv('MAILTRAP_USER', 'placeholder_user'),
  mailtrapPass: requireEnv('MAILTRAP_PASS', 'placeholder_pass'),
  mailFrom: process.env.MAIL_FROM ?? 'Adaptive Exercise <noreply@adaptive-exercise.local>',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  aiServiceUrl: process.env.AI_SERVICE_URL ?? 'http://localhost:8000',
};
