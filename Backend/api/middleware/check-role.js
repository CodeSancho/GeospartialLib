const jwt = require('jsonwebtoken');

module.exports = function(roles = []) {
  // Allow passing a single role ('admin') or multiple (['admin', 'geologist'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Ensure user is logged in and has one of the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};