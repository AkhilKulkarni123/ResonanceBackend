const { body } = require('express-validator');

const createContext = [
  body('dream_id').isUUID().withMessage('Valid dream_id is required'),
  body('questionnaire_answers').isObject().withMessage('Questionnaire answers must be an object'),
];

module.exports = { createContext };
