import { jest } from '@jest/globals';
import supertest from 'supertest';
import createApp from '../src/app.js';
import { resetStore } from '../src/store/index.js';

const app = createApp();
const request = supertest(app);

let token;

beforeEach(async () => {
  resetStore();
  // Register a fresh user and capture the JWT
  const res = await request
    .post('/api/register')
    .send({ email: 'prefs@example.com', password: 'secret123' });
  token = res.body.data.token;
});

describe('GET /api/preferences', () => {
  it('should return 401 without an auth token', async () => {
    const res = await request.get('/api/preferences');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with a malformed token', async () => {
    const res = await request
      .get('/api/preferences')
      .set('Authorization', 'Bearer invalid-token-value');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return default preferences for a new user', async () => {
    const res = await request
      .get('/api/preferences')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      categories: ['general'],
      languages: ['en'],
      countries: ['us'],
    });
  });
});

describe('PUT /api/preferences', () => {
  it('should update preferences with valid data', async () => {
    const res = await request
      .put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({
        categories: ['technology', 'science'],
        languages: ['en', 'fr'],
        countries: ['us', 'gb'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.categories).toEqual(['technology', 'science']);
    expect(res.body.data.languages).toEqual(['en', 'fr']);
    expect(res.body.data.countries).toEqual(['us', 'gb']);
  });

  it('should return 400 with an invalid category', async () => {
    const res = await request
      .put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['invalid-category'] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 when no preference field is provided', async () => {
    const res = await request
      .put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should persist preferences across requests', async () => {
    await request
      .put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['sports', 'health'] });

    const res = await request
      .get('/api/preferences')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.categories).toEqual(['sports', 'health']);
    // other fields should remain at defaults
    expect(res.body.data.languages).toEqual(['en']);
    expect(res.body.data.countries).toEqual(['us']);
  });

  it('should allow partial updates (only languages)', async () => {
    const res = await request
      .put('/api/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ languages: ['de'] });

    expect(res.status).toBe(200);
    expect(res.body.data.languages).toEqual(['de']);
    // categories and countries remain at defaults
    expect(res.body.data.categories).toEqual(['general']);
  });
});
