const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000,
      path: '/',
    });
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

const logout = (_req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  return res.status(200).json({ message: 'Logged out' });
};

const me = (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = { register, login, logout, me };
