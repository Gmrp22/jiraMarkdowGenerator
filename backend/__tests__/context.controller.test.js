jest.mock('../services/ticketStore.service');
jest.mock('../services/contextGenerator.service');

const ticketStore = require('../services/ticketStore.service');
const contextGenerator = require('../services/contextGenerator.service');
const { generate } = require('../controllers/context.controller');
const AppError = require('../utils/AppError');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockTickets = [
  { id: '1', key: 'PROJ-1', summary: 'Fix bug', description: 'desc', status: 'Open', type: 'Bug', assignee: null },
];

describe('context.controller.generate', () => {
  it('responds 200 with generated content', async () => {
    ticketStore.getById.mockReturnValue(mockTickets[0]);
    contextGenerator.generate.mockReturnValue('## [PROJ-1] Fix bug\n---');

    const req = { body: { ticketIds: ['1'] } };
    const res = makeRes();
    const next = jest.fn();

    await generate(req, res, next);

    expect(ticketStore.getById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/markdown; charset=utf-8');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="context.md"');
    expect(res.send).toHaveBeenCalledWith('## [PROJ-1] Fix bug\n---');
  });

  it('calls next with AppError 404 when a ticket is not found', async () => {
    ticketStore.getById.mockImplementation(() => { throw new AppError('Ticket not found', 404); });

    const req = { body: { ticketIds: ['99'] } };
    const next = jest.fn();

    await generate(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });

  it('calls next with error when an unexpected error occurs', async () => {
    ticketStore.getById.mockImplementation(() => { throw new Error('unexpected'); });

    const req = { body: { ticketIds: ['1'] } };
    const next = jest.fn();

    await generate(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
