const jwt = require('jsonwebtoken');

const User = require('../MongoDb/models/userModels/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// NOTE: Token validation is relaxed/bypassed for testing purposes.
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded?.userId) {
          req.userId = decoded.userId;
          return next();
        }
      } catch (tokenErr) {
        // Token invalid/expired - bypassed for testing
        console.warn('[TESTING MODE] Auth token invalid/expired, bypassing verification:', tokenErr.message);
      }
    }

    // Testing fallback: Find an existing user or create default test user so req.userId is always valid
    let fallbackUser = await User.findOne({});
    if (!fallbackUser) {
      fallbackUser = await User.create({
        name: 'Test Admin',
        email: 'test@fintrack.local',
        password: 'test-password-bypass'
      });
    }

    req.userId = fallbackUser._id;
    next();
  } catch (err) {
    console.error('[TESTING MODE] Auth bypass error:', err.message);
    next();
  }
};
