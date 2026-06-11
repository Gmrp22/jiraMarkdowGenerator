jest.mock('../config/env', () => ({
  JIRA_BASE_URL: 'https://test.atlassian.net',
  JIRA_API_TOKEN: 'test-token',
  JIRA_EMAIL: 'test@example.com',
}));

jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('jira.service', () => {
  let jiraService;
  let fetchSpy;

  const mockIssue = {
    id: '10001',
    key: 'PROJ-1',
    fields: {
      summary: 'Test ticket summary',
      description: {
        content: [
          {
            content: [{ text: 'Test description text' }],
          },
        ],
      },
      status: { name: 'In Progress' },
      issuetype: { name: 'Story' },
      assignee: { displayName: 'John Doe' },
    },
  };

  const expectedTicket = {
    id: '10001',
    key: 'PROJ-1',
    summary: 'Test ticket summary',
    description: 'Test description text',
    status: 'In Progress',
    type: 'Story',
    assignee: 'John Doe',
  };

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../config/env', () => ({
      JIRA_BASE_URL: 'https://test.atlassian.net',
      JIRA_API_TOKEN: 'test-token',
      JIRA_EMAIL: 'test@example.com',
    }));

    jest.mock('../config/logger', () => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }));

    fetchSpy = jest.spyOn(global, 'fetch');
    jiraService = require('../services/jira.service');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('fetchAllTickets', () => {
    it('normaliza correctamente los tickets de la respuesta exitosa', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ issues: [mockIssue] }),
      });

      const tickets = await jiraService.fetchAllTickets();

      expect(tickets).toHaveLength(1);
      expect(tickets[0]).toEqual(expectedTicket);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/rest/api/3/search/jql'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    it('propaga el error si fetch lanza una excepcion', async () => {
      const networkError = new Error('Network failure');
      fetchSpy.mockRejectedValue(networkError);

      await expect(jiraService.fetchAllTickets()).rejects.toThrow('Network failure');
    });
  });

  describe('fetchTicketById', () => {
    it('retorna el ticket normalizado en respuesta exitosa', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockIssue),
      });

      const ticket = await jiraService.fetchTicketById('10001');

      expect(ticket).toEqual(expectedTicket);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/rest/api/3/issue/10001'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
            Authorization: expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    it('lanza AppError 404 si la respuesta no es 200', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(jiraService.fetchTicketById('99999')).rejects.toMatchObject({
        message: 'Ticket not found in Jira',
        statusCode: 404,
      });
    });
  });
});
