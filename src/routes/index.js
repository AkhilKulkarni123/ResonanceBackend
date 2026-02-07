const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/dreams', require('./dream.routes'));
router.use('/contexts', require('./context.routes'));
router.use('/feedback', require('./feedback.routes'));
router.use('/social', require('./social.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/badges', require('./badge.routes'));
router.use('/art', require('./art.routes'));
router.use('/sleep', require('./sleep.routes'));

module.exports = router;
