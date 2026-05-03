import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  gnewsApiKey: process.env.GNEWS_API_KEY || '',
  gnewsBaseUrl: 'https://gnews.io/api/v4',
  cacheTtl: 15 * 60 * 1000, // 15 minutes in milliseconds
};

export default config;
