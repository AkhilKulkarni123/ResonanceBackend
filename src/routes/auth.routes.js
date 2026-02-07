const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signup, login } = require('../validators/auth.validator');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
});

router.post('/signup', authLimiter, signup, validate, auth.signup);
router.post('/login', authLimiter, login, validate, auth.login);
router.get('/me', authMiddleware, auth.getMe);
router.put('/profile', authMiddleware, auth.updateProfile);

module.exports = router;
