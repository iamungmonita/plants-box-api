import dotenv from 'dotenv';

dotenv.config();

export const config = {
  authTokenName: process.env.AUTH_TOKEN || 'auth_token', // Default value if .env doesn't have AUTH_TOKEN
  secretKey: process.env.JWT_SECRET || 'default_secret_key', // Secret key for JWT
  getTokenExpirationInSeconds: () => {
    const oneHourInSeconds = 60 * 60;
    return oneHourInSeconds;
  },
};
