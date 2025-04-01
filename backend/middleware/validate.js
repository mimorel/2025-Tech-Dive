const { body, validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

/**
 * Registration validation rules
 */
const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Login validation rules
 */
const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Password is required')
];

/**
 * Pin creation/update validation rules
 */
const pinRules = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('imageUrl')
    .trim()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('link')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid URL')
];

/**
 * Board creation/update validation rules
 */
const boardRules = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('privacy')
    .isIn(['public', 'private', 'secret'])
    .withMessage('Invalid privacy setting')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  pinRules,
  boardRules
}; 