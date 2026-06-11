const ticketStore = require('../services/ticketStore.service');
const contextGenerator = require('../services/contextGenerator.service');
const logger = require('../config/logger');

const generate = async (req, res, next) => {
  try {
    const { ticketIds } = req.body;
    const tickets = await Promise.all(ticketIds.map((id) => ticketStore.getById(id)));
    const content = contextGenerator.generate(tickets);
    logger.info({ count: tickets.length }, 'Context generated');
    return res.status(200).json({ content });
  } catch (err) {
    return next(err);
  }
};

module.exports = { generate };
