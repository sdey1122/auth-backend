const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      if (!token) {
        return res.status(401).json({ error: 'Authentication failed: No token provided' });
      }
  
      const tokenData = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = tokenData.id;
      next();
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(401).json({ error: 'Authentication failed: Invalid token' });
    }
};

module.exports = authenticateUser;
