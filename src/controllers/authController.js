import { createUser, findByEmail, comparePassword } from '../services/userService.js';
import { signToken } from '../utils/token.js';

/**
 * POST /api/register
 *
 * Creates a new user account. Hashes the password, stores the user in memory,
 * and returns a signed JWT for immediate authentication.
 */
export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    // Check for duplicate email
    const existing = findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await createUser(email, password);
    const token = signToken({ id: user.id, email: user.email });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/login
 *
 * Authenticates a user by email + password, and returns a signed JWT.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken({ id: user.id, email: user.email });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
