import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate.js';
import { register, login } from '../controllers/authController.js';

const router = Router();

/* ---- Validation Schemas ---- */

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long.',
    'any.required': 'Password is required.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
  }),
});

/* ---- Routes ---- */

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
