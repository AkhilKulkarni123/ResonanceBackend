const router = require('express').Router();
const art = require('../controllers/art.controller');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const artLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many art generation requests. Please try again later.' },
});

router.use(authMiddleware);

router.post('/generate', artLimiter, art.generate);
router.get('/dream/:dreamId', art.getByDream);
router.get('/gallery', art.getGallery);

module.exports = router;
