import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
export const registerValidation = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character'),
  body('name')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'ADVISOR', 'CLIENT']).withMessage('Invalid role'),
  handleValidationErrors
];

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// User validation rules
export const createUserValidation = [
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number'),
  handleValidationErrors
];

export const updateUserValidation = [
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters')
    .trim(),
  handleValidationErrors
];

// ID parameter validation
export const idValidation = [
  param('id')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Lead validation
export const createLeadValidation = [
  body('name')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .trim(),
  body('phone')
    .optional()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number'),
  body('status')
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'])
    .withMessage('Invalid lead status'),
  handleValidationErrors
];

// Calendar event validation
export const createEventValidation = [
  body('title')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters')
    .trim()
    .escape(),
  body('start')
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),
  body('end')
    .isISO8601().withMessage('Invalid end date format')
    .toDate(),
  body('type')
    .isIn(['CALL', 'MEETING', 'EMAIL', 'TASK', 'OTHER'])
    .withMessage('Invalid event type'),
  handleValidationErrors
];

// Message validation
export const createMessageValidation = [
  body('content')
    .isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters')
    .trim(),
  body('receiverId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Receiver ID is required'),
  handleValidationErrors
];

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potential XSS patterns
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        value[key] = sanitizeValue(value[key]);
      }
    }
    return value;
  };

  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  
  next();
};
