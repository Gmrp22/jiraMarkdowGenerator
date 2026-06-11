const ticketStore = require('../services/ticketStore.service');
const AppError = require('../utils/AppError');

const getAll = async (req, res, next) => {
  try {
    const tickets = await ticketStore.getAll();
    res.status(200).json({ tickets });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await ticketStore.getById(id);
    res.status(200).json({ ticket });
  } catch (err) {
    next(err);
  }
};

const search = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return next(new AppError('Query parameter q is required', 400));
    }

    const tickets = await ticketStore.search(q);
    res.status(200).json({ tickets });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, search };
