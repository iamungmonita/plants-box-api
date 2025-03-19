import dotenv from 'dotenv';

dotenv.config();

export const config = {
  authTokenName: process.env.AUTH_TOKEN || 'auth_token', // Default value if .env doesn't have AUTH_TOKEN
  secretKey: process.env.JWT_SECRET || 'default_secret_key', // Secret key for JWT
  tokenExpiration: (() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set to midnight of the next day
    return Math.floor((midnight.getTime() - now.getTime()) / 1000); // Convert to seconds
  })(),
};
