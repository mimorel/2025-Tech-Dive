const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id and other user data
 * @returns {String} JWT token
 */
function generateToken(user) {
  const payload = {
    user: {
      id: user._id,
      email: user.email,
      username: user.username
    }
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

module.exports = generateToken; 