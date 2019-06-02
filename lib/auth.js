/*
 * Auth with JWT
 */

const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

const secretKey = 'MySecretKey^';

exports.generateAuthToken = function (userId) {
  const payload = {
    sub: userId
  };
  const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });
    return token;
};

exports.requireAuth = function (req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    next();
  } catch (err) {
    console.error("  -- error:",err);
    res.status(401).send({
      error: "Invalid auth token provided."
    });
  }
};

exports.extractUserFromJWT = function (req,res,next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;

  if(token) {
    try {
      const payload = jwt.verify(token, secretKey);
      req.user = payload.sub;
      next();
    } catch (err) {
      console.error("  -- error:", err);
      res.status(401).send({
        error: "Invalid auth token provided."
      });
    }
  }
  else {
    req.user = null;
    next();
  }
}

exports.checkAdmin = async function (userId) {
  console.log("checked for admin");
  const user = await userModel.getUserById(userId);
  if (user) {
    if (user.admin == 1) {
      return true;
    }
    else {
      return false;
    }
  }
}