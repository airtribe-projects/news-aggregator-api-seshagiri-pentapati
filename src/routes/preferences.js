import { Router } from 'express';
import Joi from 'joi';
import authMiddleware from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { getPrefs, updatePrefs } from '../controllers/preferencesController.js';

const router = Router();

/* ---- Constants ---- */

const VALID_CATEGORIES = [
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health',
];

const preferencesSchema = Joi.object({
  categories: Joi.array()
    .items(Joi.string().valid(...VALID_CATEGORIES))
    .min(1)
    .messages({
      'any.only': `Each category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      'array.min': 'At least one category is required.',
    }),
  languages: Joi.array()
    .items(Joi.string().length(2).lowercase())
    .min(1)
    .messages({
      'string.length': 'Language codes must be 2 characters (e.g. "en").',
      'array.min': 'At least one language is required.',
    }),
  countries: Joi.array()
    .items(Joi.string().length(2).lowercase())
    .min(1)
    .messages({
      'string.length': 'Country codes must be 2 characters (e.g. "us").',
      'array.min': 'At least one country is required.',
    }),
}).min(1).messages({
  'object.min': 'At least one preference field (categories, languages, or countries) must be provided.',
});

/* ---- Routes ---- */

router.get('/', authMiddleware, getPrefs);
router.put('/', authMiddleware, validate(preferencesSchema), updatePrefs);

export default router;
