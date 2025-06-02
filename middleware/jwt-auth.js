const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js')

const jwt_auth = async (req, res, next) => {
  let authHeader = req.headers.authorization || req.headers.Authorization
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token provided! Not verified.'});

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log(decoded)
    const user = await User.findById(decoded.id)
    req.user = user; //  This should be a plain object
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};


module.exports = jwt_auth