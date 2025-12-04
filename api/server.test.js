const request = require('supertest');
const server = require('./server');
const usersModel = require('./users/users-model');

beforeEach(() => {
  usersModel._reset();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('returns 400 if username is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ password: 'password' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    test('returns 400 if password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    test('registers a new user successfully', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('password');
    });

    test('returns 400 if username is taken', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });
      
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password2' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username taken');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });
    });

    test('returns 400 if username is missing', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ password: 'password' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    test('returns 400 if password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    test('returns 401 if username does not exist', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });

    test('returns 401 if password is incorrect', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });

    test('logs in successfully and returns a token', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'welcome, testuser');
      expect(res.body).toHaveProperty('token');
    });
  });
});

describe('Jokes Endpoints', () => {
  describe('GET /api/jokes', () => {
    test('returns 401 without a token', async () => {
      const res = await request(server).get('/api/jokes');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('token required');
    });

    test('returns 401 with invalid token', async () => {
      const res = await request(server)
        .get('/api/jokes')
        .set('Authorization', 'invalidtoken');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('token invalid');
    });

    test('returns jokes with valid token', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'jokester', password: 'password' });
      
      const loginRes = await request(server)
        .post('/api/auth/login')
        .send({ username: 'jokester', password: 'password' });
      
      const res = await request(server)
        .get('/api/jokes')
        .set('Authorization', loginRes.body.token);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

// Sanity test
test('sanity', () => {
  expect(true).toBe(true);
});