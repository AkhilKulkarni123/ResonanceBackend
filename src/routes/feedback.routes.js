const router = require('express').Router();
const feedback = require('../controllers/feedback.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', feedback.create);
router.get('/history', feedback.getHistory);
router.get('/dream/:dreamId', feedback.getByDream);

module.exports = router;
