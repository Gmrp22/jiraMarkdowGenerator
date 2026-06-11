jest.mock('../services/auth.service');

const authService = require('../services/auth.service');
const { register, login, logout, me } = require('../controllers/auth.controller');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
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
  it('sets auth_token cookie and responds 200 with user on success', async () => {
    const user = { id: '1', email: 'a@b.com', role: 'user' };
    authService.login.mockResolvedValue({ token: 'jwt-token', user });

    const req = { body: { email: 'a@b.com', password: 'password123' } };
    const res = makeRes();
    const next = jest.fn();

    await login(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      'auth_token',
      'jwt-token',
      expect.objectContaining({ httpOnly: true, path: '/' })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });

  it('calls next with error on service failure', async () => {
    authService.login.mockRejectedValue(new Error('fail'));
    const req = { body: { email: 'a@b.com', password: 'password123' } };
    const next = jest.fn();

    await login(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('auth.controller.logout', () => {
  it('clears auth_token cookie and responds 200', () => {
    const res = makeRes();
    const next = jest.fn();

    logout({}, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith('auth_token', { path: '/' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });
});

describe('auth.controller.me', () => {
  it('responds 200 with the authenticated user', () => {
    const user = { id: '1', email: 'a@b.com', role: 'user' };
    const req = { user };
    const res = makeRes();

    me(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user });
  });
});
