const redis = require('../services/redisService');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const storedPass = await redis.get(`user:${username}:password`);
  if (!storedPass || storedPass !== password) {
    return res.status(401).send('Invalid credentials');
  }
  res.cookie('auth', username, { httpOnly: true });
  res.redirect('/admin');
};

exports.logout = (req, res) => {
  res.clearCookie('auth');
  res.redirect('/admin/login');
};

exports.signup = async (req, res) => {
    const { username, password } = req.body;
    const existing = await redis.get(`user:${username}:password`);
    if (existing) return res.status(409).send('User already exists');
    await redis.set(`user:${username}:password`, password);
    res.send('Signup successful');
  };
  