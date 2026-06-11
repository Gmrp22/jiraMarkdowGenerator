jest.mock('../services/auth.service');

const authService = require('../services/auth.service');
const { register, login } = require('../controllers/auth.controller');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('auth.controller.register', () => {
  it('responds 201 with user on success', async () => {
    const user = { id: '1', email: 'a@b.com', role: 'user' };
    authService.register.mockResolvedValue(user);

    const req = { body: { email: 'a@b.com', password: 'password123' } };
    const res = makeRes();
    const next = jest.fn();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  it('calls next with error on service failure', async () => {
    authService.register.mockRejectedValue(new Error('fail'));
    const req = { body: { email: 'a@b.com', password: 'password123' } };
    const next = jest.fn();

    await register(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('auth.controller.login', () => {
  it('responds 200 with token on success', async () => {
    authService.login.mockResolvedValue({ token: 'jwt-token' });

    const req = { body: { email: 'a@b.com', password: 'password123' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt-token' });
  });

  it('calls next with error on service failure', async () => {
    authService.login.mockRejectedValue(new Error('fail'));
    const req = { body: { email: 'a@b.com', password: 'password123' } };
    const next = jest.fn();

    await login(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
