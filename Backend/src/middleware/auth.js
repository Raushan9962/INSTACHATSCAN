const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'User not found or inactive',
        code: 'INVALID_USER'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required', code: 'ADMIN_ONLY' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens');
      if (user && user.isActive) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { auth, adminAuth, optionalAuth };
