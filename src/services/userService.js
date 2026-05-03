import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import store from '../store/index.js';

const SALT_ROUNDS = 10;

/**
 * Default preferences assigned to every new user.
 */
const DEFAULT_PREFERENCES = {
  categories: ['general'],
  languages: ['en'],
  countries: ['us'],
};

/**
 * Create a new user with a hashed password and default preferences.
 * @param {string} email
 * @param {string} password — plaintext, will be hashed
 * @returns {Promise<{ id: string, email: string, preferences: object, createdAt: string }>}
 */
export async function createUser(email, password) {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id,
    email,
    password: hashedPassword,
    preferences: { ...DEFAULT_PREFERENCES },
    createdAt: new Date().toISOString(),
  };
  store.users.set(id, user);
  return { id: user.id, email: user.email, preferences: user.preferences, createdAt: user.createdAt };
}

/**
 * Find a user by email address.
 * @param {string} email
 * @returns {object|undefined}
 */
export function findByEmail(email) {
  for (const user of store.users.values()) {
    if (user.email === email) return user;
  }
  return undefined;
}

/**
 * Find a user by their unique ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export function findById(id) {
  return store.users.get(id);
}

/**
 * Compare a plaintext password against a stored hash.
 * @param {string} plaintext
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Update a user's news preferences.
 * @param {string} userId
 * @param {{ categories?: string[], languages?: string[], countries?: string[] }} prefs
 * @returns {object} updated preferences
 */
export function updatePreferences(userId, prefs) {
  const user = store.users.get(userId);
  if (!user) throw new Error('User not found');
  user.preferences = { ...user.preferences, ...prefs };
  return user.preferences;
}

/**
 * Get a user's current preferences.
 * @param {string} userId
 * @returns {object}
 */
export function getPreferences(userId) {
  const user = store.users.get(userId);
  if (!user) throw new Error('User not found');
  return user.preferences;
}
