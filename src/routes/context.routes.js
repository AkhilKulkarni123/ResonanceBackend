const router = require('express').Router();
const context = require('../controllers/context.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createContext } = require('../validators/context.validator');

router.use(authMiddleware);

router.post('/', createContext, validate, context.create);
router.get('/questions', context.getQuestions);

module.exports = router;
