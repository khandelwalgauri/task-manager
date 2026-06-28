const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  console.log('AUTH HEADER:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      console.log('TOKEN:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('DECODED:', decoded);

      req.user = await User.findById(decoded.id).select('-password');

      console.log('USER:', req.user);

      next();
    } catch (error) {
      console.log('ERROR:', error.message);

      return res.status(401).json({
        message: 'Not authorized',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
    });
  }
};

module.exports = { protect };
