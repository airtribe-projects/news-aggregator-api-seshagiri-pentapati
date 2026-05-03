/**
 * In-Memory Data Store
 *
 * users:        Map<id, { id, email, password, preferences, createdAt }>
 * readArticles: Map<userId, Set<articleUrl>>
 * articles:     Map<encodedUrl, articleObject>  — flat lookup for GET /news/:id
 * cache:        Map<cacheKey, { data, timestamp }>
 */

const store = {
  users: new Map(),
  readArticles: new Map(),
  articles: new Map(),
  cache: new Map(),
};

/**
 * Reset the entire store — used by tests to guarantee isolation.
 */
export function resetStore() {
  store.users.clear();
  store.readArticles.clear();
  store.articles.clear();
  store.cache.clear();
}

export default store;
