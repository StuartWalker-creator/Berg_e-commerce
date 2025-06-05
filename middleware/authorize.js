const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('reached Authorize')
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = authorize