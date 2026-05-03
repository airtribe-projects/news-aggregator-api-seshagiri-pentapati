import { getPreferences, updatePreferences } from '../services/userService.js';

/**
 * GET /api/preferences
 *
 * Returns the authenticated user's current news preferences.
 */
export function getPrefs(req, res, next) {
  try {
    const preferences = getPreferences(req.user.id);
    return res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/preferences
 *
 * Updates the authenticated user's news preferences.
 * Accepts categories, languages, and countries arrays.
 */
export function updatePrefs(req, res, next) {
  try {
    const updated = updatePreferences(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
