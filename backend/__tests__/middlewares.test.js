jest.mock('jsonwebtoken');
jest.mock('../config/env', () => ({ JWT_SECRET: 'test-secret' }));

const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const errorHandler = require('../middlewares/errorHandler.middleware');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const makeNext = () => jest.fn();
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── authMiddleware ────────────────────────────────────────────────────────────

describe('authMiddleware', () => {
  it('calls next with 401 when cookie is missing', () => {
    const req = { cookies: {} };
    const next = makeNext();
    authMiddleware(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('calls next with 401 when cookies object is absent', () => {
    const req = {};
    const next = makeNext();
    authMiddleware(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('attaches decoded user and calls next when token is valid', () => {
    jwt.verify.mockReturnValue({ id: '1', email: 'a@b.com', role: 'user' });
    const req = { cookies: { auth_token: 'valid-token' } };
    const next = makeNext();
    authMiddleware(req, makeRes(), next);
    expect(req.user).toEqual({ id: '1', email: 'a@b.com', role: 'user' });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with 401 when token verification throws', () => {
    jwt.verify.mockImplementation(() => { throw new Error('expired'); });
    const req = { cookies: { auth_token: 'bad-token' } };
    const next = makeNext();
    authMiddleware(req, makeRes(), next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });
});

// ── validate middleware ───────────────────────────────────────────────────────

describe('validate', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('sets req.body to parsed data and calls next when valid', () => {
    const req = { body: { name: 'Alice' } };
    const next = makeNext();
    validate(schema)(req, makeRes(), next);
    expect(req.body).toEqual({ name: 'Alice' });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next with AppError 400 when body is invalid', () => {
    const req = { body: { name: '' } };
    const next = makeNext();
    validate(schema)(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});

// ── errorHandler ─────────────────────────────────────────────────────────────

describe('errorHandler', () => {
  it('responds with AppError statusCode and message', () => {
    const err = new AppError('Not found', 404);
    const res = makeRes();
    errorHandler(err, {}, res, makeNext());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: { message: 'Not found', statusCode: 404 } });
  });

  it('responds with 500 for unexpected errors', () => {
    const err = new Error('boom');
    const res = makeRes();
    errorHandler(err, {}, res, makeNext());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: { message: 'boom', statusCode: 500 } });
  });
});
