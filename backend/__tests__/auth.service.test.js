jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../config/env', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '1h',
}));
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('auth.service', () => {
  let authService;
  let bcrypt;
  let jwt;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('bcrypt');
    jest.mock('jsonwebtoken');
    jest.mock('../config/env', () => ({
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
    }));
    jest.mock('../config/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));

    bcrypt = require('bcrypt');
    jwt = require('jsonwebtoken');
    authService = require('../services/auth.service');
  });

  describe('register', () => {
    it('registra un usuario nuevo y retorna el usuario sin passwordHash', async () => {
      bcrypt.hash.mockResolvedValue('hashed-password');

      const user = await authService.register('test@example.com', 'password123');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email', 'test@example.com');
      expect(user).toHaveProperty('role', 'user');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('lanza AppError 409 si el email ya está registrado', async () => {
      bcrypt.hash.mockResolvedValue('hashed-password');

      await authService.register('dup@example.com', 'password123');

      await expect(authService.register('dup@example.com', 'password123')).rejects.toMatchObject({
        message: 'Email already registered',
        statusCode: 409,
      });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      bcrypt.hash.mockResolvedValue('hashed-password');
      await authService.register('login@example.com', 'password123');
    });

    it('retorna token al hacer login con credenciales válidas', async () => {
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('signed-token');

      const result = await authService.login('login@example.com', 'password123');

      expect(result.token).toBe('signed-token');
      expect(result.user).toHaveProperty('email', 'login@example.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('lanza AppError 401 si el email no existe', async () => {
      await expect(authService.login('noexiste@example.com', 'password123')).rejects.toMatchObject({
        message: 'Invalid credentials',
        statusCode: 401,
      });
    });

    it('lanza AppError 401 si la password es incorrecta', async () => {
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login('login@example.com', 'wrongpassword')).rejects.toMatchObject({
        message: 'Invalid credentials',
        statusCode: 401,
      });
    });
  });
});
