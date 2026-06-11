const ticketStore = require('../services/ticketStore.service');

jest.mock('../services/ticketStore.service');

const { getAll, getById, search } = require('../controllers/ticket.controller');
const AppError = require('../utils/AppError');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('ticket.controller', () => {
  let res;
  let next;

  beforeEach(() => {
    res = makeRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('responde 200 con { tickets }', async () => {
      const mockTickets = [{ id: '1', key: 'PROJ-1', summary: 'Test ticket' }];
      ticketStore.getAll.mockResolvedValue(mockTickets);

      const req = {};
      await getAll(req, res, next);

      expect(ticketStore.getAll).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ tickets: mockTickets });
      expect(next).not.toHaveBeenCalled();
    });

    it('llama next con el error si el store lanza', async () => {
      const error = new Error('Store error');
      ticketStore.getAll.mockRejectedValue(error);

      const req = {};
      await getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('responde 200 con { ticket } usando el id correcto', async () => {
      const mockTicket = { id: '42', key: 'PROJ-42', summary: 'A ticket' };
      ticketStore.getById.mockResolvedValue(mockTicket);

      const req = { params: { id: '42' } };
      await getById(req, res, next);

      expect(ticketStore.getById).toHaveBeenCalledWith('42');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ticket: mockTicket });
      expect(next).not.toHaveBeenCalled();
    });

    it('llama next con AppError 404 si el store lanza', async () => {
      const error = new AppError('Ticket not found', 404);
      ticketStore.getById.mockRejectedValue(error);

      const req = { params: { id: 'NONEXISTENT' } };
      await getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('search', () => {
    it('responde 200 con { tickets } cuando q es válido', async () => {
      const mockTickets = [{ id: '1', key: 'PROJ-1', summary: 'Login bug' }];
      ticketStore.search.mockResolvedValue(mockTickets);

      const req = { query: { q: 'login' } };
      await search(req, res, next);

      expect(ticketStore.search).toHaveBeenCalledWith('login');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ tickets: mockTickets });
      expect(next).not.toHaveBeenCalled();
    });

    it('llama next con AppError 400 cuando q está ausente', async () => {
      const req = { query: {} };
      await search(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(ticketStore.search).not.toHaveBeenCalled();
    });

    it('llama next con AppError 400 cuando q es string vacío', async () => {
      const req = { query: { q: '   ' } };
      await search(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(ticketStore.search).not.toHaveBeenCalled();
    });

    it('llama next con el error si el store lanza', async () => {
      const error = new Error('Search failed');
      ticketStore.search.mockRejectedValue(error);

      const req = { query: { q: 'bug' } };
      await search(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
