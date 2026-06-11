jest.mock('../services/jira.service');

const jiraService = require('../services/jira.service');
const ticketStore = require('../services/ticketStore.service');
const AppError = require('../utils/AppError');

const mockTickets = [
  { id: '1', key: 'PROJ-1', summary: 'Fix bug', description: 'A bug', status: 'Open', type: 'Bug', assignee: null },
  { id: '2', key: 'PROJ-2', summary: 'Add feature', description: 'New thing', status: 'Done', type: 'Story', assignee: 'Alice' },
];

beforeEach(async () => {
  jiraService.fetchAllTickets.mockResolvedValue(mockTickets);
  await ticketStore.refresh();
});

describe('ticketStore.refresh', () => {
  it('loads tickets from jira into the store', async () => {
    expect(await ticketStore.getAll()).toHaveLength(2);
  });

  it('clears previous tickets on refresh', async () => {
    jiraService.fetchAllTickets.mockResolvedValue([mockTickets[0]]);
    await ticketStore.refresh();
    expect(await ticketStore.getAll()).toHaveLength(1);
  });
});

describe('ticketStore.getAll', () => {
  it('returns all tickets', async () => {
    const tickets = await ticketStore.getAll();
    expect(tickets).toHaveLength(2);
  });
});

describe('ticketStore.getById', () => {
  it('returns the ticket when found by key', async () => {
    const ticket = await ticketStore.getById('PROJ-1');
    expect(ticket.key).toBe('PROJ-1');
  });

  it('throws AppError 404 when not found', async () => {
    await expect(ticketStore.getById('PROJ-99')).rejects.toThrow(AppError);
    await expect(ticketStore.getById('PROJ-99')).rejects.toThrow('Ticket not found');
  });
});

describe('ticketStore.search', () => {
  it('filters by summary (case-insensitive)', async () => {
    const results = await ticketStore.search('fix');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('PROJ-1');
  });

  it('filters by description (case-insensitive)', async () => {
    const results = await ticketStore.search('new thing');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('PROJ-2');
  });

  it('returns empty array when no matches', async () => {
    expect(await ticketStore.search('xyz123')).toHaveLength(0);
  });
});
