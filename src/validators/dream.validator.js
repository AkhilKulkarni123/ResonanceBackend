const { body } = require('express-validator');

const createDream = [
  body('title').optional().isString().isLength({ max: 200 }),
  body('transcript').optional().isString(),
  body('mood').optional().isIn(['happy', 'sad', 'anxious', 'neutral', 'fearful', 'excited', 'confused', 'peaceful']),
  body('categories').optional().isArray(),
  body('tags').optional().isArray(),
];

const updateDream = [
  body('title').optional().isString().isLength({ max: 200 }),
  body('transcript').optional().isString(),
  body('mood').optional().isIn(['happy', 'sad', 'anxious', 'neutral', 'fearful', 'excited', 'confused', 'peaceful']),
  body('categories').optional().isArray(),
  body('tags').optional().isArray(),
  body('is_public').optional().isBoolean(),
];

module.exports = { createDream, updateDream };
