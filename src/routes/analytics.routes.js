const router = require('express').Router();
const analytics = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', analytics.getDashboard);

module.exports = router;
