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
  const jql = encodeURIComponent(`project = ${env.JIRA_PROJECT_KEY} ORDER BY created DESC`);
  const fields = 'summary,description,status,issuetype,assignee';
  const url = `${env.JIRA_BASE_URL}/rest/api/3/search/jql?jql=${jql}&maxResults=100&fields=${fields}`;

  logger.info('Fetching all tickets from Jira');

  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error({ status: response.status, body: text }, 'Jira search request failed');
    throw new AppError(`Jira API error: ${response.status}`, response.status);
  }

  const data = await response.json();
  const tickets = (data.issues ?? []).map(normalizeIssue);

  logger.info({ count: tickets.length }, 'Tickets fetched from Jira');

  return tickets;
};

const fetchTicketById = async (key) => {
  const url = `${env.JIRA_BASE_URL}/rest/api/3/issue/${key}?fields=summary,description,status,issuetype,assignee`;

  logger.info({ key }, 'Fetching ticket by key from Jira');

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
