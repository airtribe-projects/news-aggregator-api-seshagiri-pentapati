import config from '../config/index.js';
import store from '../store/index.js';

/**
 * Build a cache key from the request type and parameters.
 */
function buildCacheKey(prefix, params) {
  return `${prefix}:${JSON.stringify(params)}`;
}

/**
 * Check the in-memory cache for a valid (non-expired) entry.
 * @param {string} key
 * @returns {object|null} cached data or null
 */
function getFromCache(key) {
  const entry = store.cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > config.cacheTtl) {
    store.cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Store data in the in-memory cache.
 */
function setCache(key, data) {
  store.cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Index each article by its URL (used as a unique ID) in the flat articles Map
 * so they can be retrieved individually via GET /news/:id.
 */
function indexArticles(articles) {
  for (const article of articles) {
    if (article.url) {
      const encodedId = encodeURIComponent(article.url);
      store.articles.set(encodedId, article);
    }
  }
}

/**
 * Fetch top headlines from GNews, filtered by user preferences.
 * Results are cached for 15 minutes.
 *
 * @param {{ categories: string[], languages: string[], countries: string[] }} preferences
 * @returns {Promise<{ totalArticles: number, articles: object[] }>}
 */
export async function fetchTopHeadlines(preferences) {
  const category = preferences.categories[0] || 'general';
  const lang = preferences.languages[0] || 'en';
  const country = preferences.countries[0] || 'us';

  const cacheKey = buildCacheKey('headlines', { category, lang, country });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = `${config.gnewsBaseUrl}/top-headlines?category=${category}&lang=${lang}&country=${country}&max=10&apikey=${config.gnewsApiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(`GNews API error: ${response.status} — ${errorBody}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const result = {
    totalArticles: data.totalArticles || data.articles?.length || 0,
    articles: data.articles || [],
  };

  indexArticles(result.articles);
  setCache(cacheKey, result);
  return result;
}

/**
 * Search GNews for articles matching a keyword, filtered by user language.
 * Results are cached for 15 minutes.
 *
 * @param {string} keyword
 * @param {{ languages: string[] }} preferences
 * @returns {Promise<{ totalArticles: number, articles: object[] }>}
 */
export async function searchNews(keyword, preferences) {
  const lang = preferences.languages[0] || 'en';

  const cacheKey = buildCacheKey('search', { keyword, lang });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = `${config.gnewsBaseUrl}/search?q=${encodeURIComponent(keyword)}&lang=${lang}&max=10&apikey=${config.gnewsApiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorBody = await response.text();
    const err = new Error(`GNews API error: ${response.status} — ${errorBody}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await response.json();
  const result = {
    totalArticles: data.totalArticles || data.articles?.length || 0,
    articles: data.articles || [],
  };

  indexArticles(result.articles);
  setCache(cacheKey, result);
  return result;
}

/**
 * Get a single article by its encoded URL (used as an ID).
 * @param {string} encodedId
 * @returns {object|undefined}
 */
export function getArticleById(encodedId) {
  return store.articles.get(encodedId);
}

/**
 * Mark an article as read for a specific user.
 * @param {string} userId
 * @param {string} articleUrl — the decoded article URL
 */
export function markAsRead(userId, articleUrl) {
  if (!store.readArticles.has(userId)) {
    store.readArticles.set(userId, new Set());
  }
  store.readArticles.get(userId).add(articleUrl);
}

/**
 * Get all articles marked as read by a specific user.
 * @param {string} userId
 * @returns {string[]} array of article URLs
 */
export function getReadArticles(userId) {
  const set = store.readArticles.get(userId);
  return set ? Array.from(set) : [];
}
