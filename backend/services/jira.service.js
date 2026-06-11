const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const { ticketSchema } = require('../models/ticket.model');

const getAuthHeader = () => {
  const credentials = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
  return `Basic ${credentials}`;
};

const normalizeIssue = (issue) => {
  const raw = {
    id: issue.id,
    key: issue.key,
    summary: issue.fields.summary ?? '',
    description: issue.fields.description?.content?.[0]?.content?.[0]?.text ?? '',
    status: issue.fields.status?.name ?? '',
    type: issue.fields.issuetype?.name ?? '',
    assignee: issue.fields.assignee?.displayName ?? null,
  };

  return ticketSchema.parse(raw);
};

const fetchAllTickets = async () => {
  const url = `${env.JIRA_BASE_URL}/rest/api/3/search?maxResults=100`;

  logger.info('Fetching all tickets from Jira');

  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  const tickets = data.issues.map(normalizeIssue);

  logger.info({ count: tickets.length }, 'Tickets fetched from Jira');

  return tickets;
};

const fetchTicketById = async (id) => {
  const url = `${env.JIRA_BASE_URL}/rest/api/3/issue/${id}`;

  logger.info({ id }, 'Fetching ticket by id from Jira');

  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new AppError('Ticket not found in Jira', 404);
  }

  const issue = await response.json();
  return normalizeIssue(issue);
};

module.exports = { fetchAllTickets, fetchTicketById };
