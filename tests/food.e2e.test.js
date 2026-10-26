const request = require('supertest');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists for tests
const uploadsDir = path.join(__dirname, '..', 'src', 'uploads');
const videosDir = path.join(__dirname, '..', 'uploads', 'videos');
try {
  fs.mkdirSync(videosDir, { recursive: true });
} catch (_) {}

// Mock DB model to avoid real MongoDB in tests
jest.mock('../src/models/food.model', () => ({
  create: jest.fn(async (doc) => ({ _id: 'food123', ...doc })),
  find: jest.fn(async () => []),
}));

jest.mock('../src/services/storage.service', () => ({
  uploadFile: jest.fn(async (_buffer, fileName) => ({
    url: `https://ik.imagekit.io/test/${fileName}`,
  })),
}));

describe('POST /api/food', () => {
  test('successful create by food partner', async () => {
    jest.resetModules();
    jest.doMock('../src/middlewares/auth.middleware', () => ({
      authFoodPartnerMiddleware: (req, _res, next) => {
        req.foodPartner = { _id: '507f1f77bcf86cd799439011' };
        next();
      },
      authUserMiddleware: (_req, _res, next) => next(),
    }));

    const app = require('../src/app');

    const res = await request(app)
      .post('/api/food')
      .field('name', 'Test Food')
      .field('description', 'Tasty')
      .attach('video', Buffer.from('dummy'), 'video.mp4');

    expect(res.status).toBe(201);
    expect(res.body.food).toBeDefined();
    expect(res.body.food.video).toMatch(/^https:\/\/ik\.imagekit\.io\/test\//);
  });

  test('forbidden for unauthenticated user', async () => {
    jest.resetModules();
    jest.doMock('../src/middlewares/auth.middleware', () => ({
      authFoodPartnerMiddleware: (req, res) => res.status(401).json({ message: 'Unauthorized' }),
      authUserMiddleware: (_req, _res, next) => next(),
    }));

    const app = require('../src/app');

    const res = await request(app)
      .post('/api/food')
      .field('name', 'Test Food')
      .attach('video', Buffer.from('dummy'), 'video.mp4');

    expect(res.status).toBe(401);
  });

  test('invalid file type rejected', async () => {
    jest.resetModules();
    jest.doMock('../src/middlewares/auth.middleware', () => ({
      authFoodPartnerMiddleware: (req, _res, next) => { req.foodPartner = { _id: '507f1f77bcf86cd799439011' }; next(); },
      authUserMiddleware: (_req, _res, next) => next(),
    }));

    const app = require('../src/app');

    const res = await request(app)
      .post('/api/food')
      .field('name', 'Bad File')
      .attach('video', Buffer.from('dummy'), 'image.png');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Only video files/);
  });

  test('oversized file returns 413 (simulated)', async () => {
    jest.resetModules();
    const originalMulter = jest.requireActual('multer');
    class MulterError extends Error { constructor(code) { super(code); this.code = code; } }
    jest.doMock('multer', () => {
      const mock = () => ({
        single: () => (req, res, cb) => cb(new MulterError('LIMIT_FILE_SIZE')),
      });
      mock.diskStorage = originalMulter.diskStorage;
      mock.memoryStorage = originalMulter.memoryStorage;
      mock.MulterError = MulterError;
      return mock;
    });
    jest.doMock('../src/middlewares/auth.middleware', () => ({
      authFoodPartnerMiddleware: (req, _res, next) => { req.foodPartner = { _id: '507f1f77bcf86cd799439011' }; next(); },
      authUserMiddleware: (_req, _res, next) => next(),
    }));

    const app = require('../src/app');
    const res = await request(app)
      .post('/api/food')
      .field('name', 'Too Big')
      .attach('video', Buffer.from('dummy'), 'video.mp4');

    expect(res.status).toBe(413);
  });
});
