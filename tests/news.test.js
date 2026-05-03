import { jest } from '@jest/globals';
import supertest from 'supertest';
import createApp from '../src/app.js';
import { resetStore } from '../src/store/index.js';
import store from '../src/store/index.js';

const app = createApp();
const request = supertest(app);

/* ---- Mock GNews API responses ---- */

const MOCK_ARTICLES = [
  {
    title: 'Breaking: Tech Advances',
    description: 'Major technology breakthroughs announced today.',
    url: 'https://example.com/tech-advances',
    image: 'https://example.com/image1.jpg',
    publishedAt: '2025-01-15T10:00:00Z',
    source: { name: 'TechNews', url: 'https://example.com' },
  },
  {
    title: 'Sports Update',
    description: 'Championship finals results are in.',
    url: 'https://example.com/sports-update',
    image: 'https://example.com/image2.jpg',
    publishedAt: '2025-01-15T09:00:00Z',
    source: { name: 'SportDaily', url: 'https://example.com' },
  },
];

const MOCK_GNEWS_RESPONSE = {
  totalArticles: 2,
  articles: MOCK_ARTICLES,
};

let token;
let originalFetch;

beforeAll(() => {
  originalFetch = global.fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

beforeEach(async () => {
  resetStore();

  // Mock global.fetch to intercept GNews API calls
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(MOCK_GNEWS_RESPONSE),
      text: () => Promise.resolve(JSON.stringify(MOCK_GNEWS_RESPONSE)),
    })
  );

  // Register a fresh user and capture the JWT
  const res = await request
    .post('/api/register')
    .send({ email: 'news@example.com', password: 'secret123' });
  token = res.body.data.token;
});

describe('GET /api/news', () => {
  it('should return 401 without auth', async () => {
    const res = await request.get('/api/news');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return top headlines based on user preferences', async () => {
    const res = await request
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalArticles).toBe(2);
    expect(res.body.data.articles).toHaveLength(2);
    expect(res.body.data.articles[0].title).toBe('Breaking: Tech Advances');
  });

  it('should use cache on second call (fetch called only once)', async () => {
    await request
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`);

    await request
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`);

    // fetch is called once for the first request; the second is served from cache
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/news/search/:keyword', () => {
  it('should search for news articles by keyword', async () => {
    const res = await request
      .get('/api/news/search/technology')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.articles).toBeDefined();
  });

  it('should cache search results', async () => {
    await request
      .get('/api/news/search/technology')
      .set('Authorization', `Bearer ${token}`);

    await request
      .get('/api/news/search/technology')
      .set('Authorization', `Bearer ${token}`);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/news/:id', () => {
  it('should return a single article by encoded URL', async () => {
    // First, populate the articles store via a headlines call
    await request
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`);

    const encodedId = encodeURIComponent('https://example.com/tech-advances');
    const res = await request
      .get(`/api/news/${encodedId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Breaking: Tech Advances');
  });

  it('should return 404 for a non-existent article', async () => {
    const encodedId = encodeURIComponent('https://example.com/not-found');
    const res = await request
      .get(`/api/news/${encodedId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/news/:id/read', () => {
  it('should mark an article as read', async () => {
    // Populate articles
    await request
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`);

    const encodedId = encodeURIComponent('https://example.com/tech-advances');
    const res = await request
      .post(`/api/news/${encodedId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/marked as read/i);
  });

  it('should return 404 when marking a non-existent article as read', async () => {
    const encodedId = encodeURIComponent('https://example.com/nonexistent');
    const res = await request
      .post(`/api/news/${encodedId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/news/read', () => {
  it('should return an empty list when no articles have been read', async () => {
    const res = await request
      .get('/api/news/read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return the list of read article URLs', async () => {
    // Populate articles and mark one as read
    await request
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`);

    const encodedId = encodeURIComponent('https://example.com/tech-advances');
    await request
      .post(`/api/news/${encodedId}/read`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request
      .get('/api/news/read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toContain('https://example.com/tech-advances');
  });
});
