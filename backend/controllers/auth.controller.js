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
    const data = await authService.login(email, password);
    return res.status(200).json(data);
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
