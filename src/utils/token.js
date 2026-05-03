import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Sign a JWT containing the user's id and email.
 * @param {{ id: string, email: string }} payload
 * @returns {string} signed JWT
 */
export function signToken(payload) {
  return jwt.sign(
    { id: payload.id, email: payload.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ id: string, email: string }} decoded payload
 * @throws {Error} if token is invalid or expired
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
