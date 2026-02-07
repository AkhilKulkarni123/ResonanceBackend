const router = require('express').Router();
const badge = require('../controllers/badge.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', badge.getAll);

module.exports = router;
