import { getPreferences } from '../services/userService.js';
import {
  fetchTopHeadlines,
  searchNews,
  getArticleById,
  markAsRead,
  getReadArticles,
} from '../services/newsService.js';

/**
 * GET /api/news
 *
 * Returns top headlines based on the authenticated user's preferences.
 * Results are cached in memory for 15 minutes.
 */
export async function getNews(req, res, next) {
  try {
    const preferences = getPreferences(req.user.id);
    const result = await fetchTopHeadlines(preferences);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/news/search/:keyword
 *
 * Searches for news articles matching the given keyword.
 * Respects the user's language preference for filtering.
 */
export async function searchArticles(req, res, next) {
  try {
    const { keyword } = req.params;
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search keyword is required.',
      });
    }

    const preferences = getPreferences(req.user.id);
    const result = await searchNews(keyword.trim(), preferences);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/news/:id
 *
 * Retrieves a single article by its encoded URL (used as an ID).
 * The article must exist in the cache from a previous headlines/search call.
 */
export function getArticle(req, res, next) {
  try {
    const { id } = req.params;
    const article = getArticleById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found. It may not be cached — try fetching headlines or searching first.',
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/news/:id/read
 *
 * Marks an article as "read" for the authenticated user.
 * The article must exist in the cache.
 */
export function markArticleRead(req, res, next) {
  try {
    const { id } = req.params;
    const article = getArticleById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    markAsRead(req.user.id, article.url);

    return res.status(200).json({
      success: true,
      message: 'Article marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/news/read
 *
 * Returns a list of article URLs the authenticated user has marked as read.
 */
export function getReadList(req, res, next) {
  try {
    const articles = getReadArticles(req.user.id);
    return res.status(200).json({
      success: true,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
}
