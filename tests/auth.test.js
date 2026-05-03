import { jest } from '@jest/globals';
import supertest from 'supertest';
import createApp from '../src/app.js';
import { resetStore } from '../src/store/index.js';

const app = createApp();
const request = supertest(app);

beforeEach(() => {
  resetStore();
});

describe('POST /api/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request
      .post('/api/register')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alice@example.com');
    expect(res.body.data.user.preferences).toBeDefined();
    // password should never leak
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should return 409 when registering with an existing email', async () => {
    await request
      .post('/api/register')
      .send({ email: 'alice@example.com', password: 'secret123' });

    const res = await request
      .post('/api/register')
      .send({ email: 'alice@example.com', password: 'different456' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should return 400 for an invalid email', async () => {
    const res = await request
      .post('/api/register')
      .send({ email: 'not-an-email', password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 for a password shorter than 6 characters', async () => {
    const res = await request
      .post('/api/register')
      .send({ email: 'bob@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 when email is missing', async () => {
    const res = await request
      .post('/api/register')
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request
      .post('/api/register')
      .send({ email: 'bob@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/login', () => {
  beforeEach(async () => {
    await request
      .post('/api/register')
      .send({ email: 'alice@example.com', password: 'secret123' });
  });

  it('should login with valid credentials and return a token', async () => {
    const res = await request
      .post('/api/login')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alice@example.com');
  });

  it('should return 401 for a wrong password', async () => {
    const res = await request
      .post('/api/login')
      .send({ email: 'alice@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 401 for a non-existent email', async () => {
    const res = await request
      .post('/api/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should return 400 for missing email in login', async () => {
    const res = await request
      .post('/api/login')
      .send({ password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
