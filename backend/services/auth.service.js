const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const users = new Map();

const register = async (email, password) => {
  if (users.has(email)) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  const user = { id, email, passwordHash, role: 'user' };
  users.set(email, user);

  logger.info({ email }, 'User registered');

  // eslint-disable-next-line no-unused-vars
  const { passwordHash: _omit, ...safeUser } = user;
  return safeUser;
};

const login = async (email, password) => {
  const user = users.get(email);

  if (!user) {
    logger.warn({ email }, 'Login failed');
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    logger.warn({ email }, 'Login failed');
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  logger.info({ email }, 'User logged in');

  return { token };
};

module.exports = { register, login };
