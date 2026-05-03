/**
 * Input Validation Middleware Factory
 *
 * Accepts a Joi schema and returns an Express middleware that validates
 * req.body against it. Returns 400 with detailed error messages on failure.
 *
 * @param {import('joi').ObjectSchema} schema — Joi validation schema
 * @returns {Function} Express middleware
 */
export default function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // report all errors, not just the first
      stripUnknown: true,  // remove unknown keys silently
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: messages,
      });
    }

    req.body = value; // use the sanitized value going forward
    next();
  };
}
