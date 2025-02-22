// src/config/config.ts
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  authTokenName: process.env.AUTH_TOKEN || "auth_token", // Default value if .env doesn't have AUTH_TOKEN
  secretKey: process.env.JWT_SECRET || "default_secret_key", // Secret key for JWT
  tokenExpiration: 1 * 60 * 60, // Token expiration in seconds (1 hour)
};
