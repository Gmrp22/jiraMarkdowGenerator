const jiraService = require('./jira.service');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const store = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutos
let lastLoadedAt = null;

const refresh = async () => {
  const tickets = await jiraService.fetchAllTickets();

  store.clear();
  tickets.forEach((ticket) => {
    store.set(ticket.key, ticket);
  });

  lastLoadedAt = Date.now();
  logger.info({ count: store.size }, 'Ticket store refreshed');
};

const ensureLoaded = async () => {
  const expired = !lastLoadedAt || Date.now() - lastLoadedAt > TTL_MS;
  if (store.size === 0 || expired) await refresh();
};

const getAll = async () => {
  await ensureLoaded();
  return Array.from(store.values());
};

const getById = async (id) => {
  await ensureLoaded();
  const ticket = store.get(id);

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  return ticket;
};

const search = async (query) => {
  await ensureLoaded();
  const lowerQuery = query.toLowerCase();

  return Array.from(store.values()).filter(
    (ticket) =>
      ticket.summary.toLowerCase().includes(lowerQuery) ||
      ticket.description.toLowerCase().includes(lowerQuery)
  );
};

module.exports = { refresh, getAll, getById, search };
