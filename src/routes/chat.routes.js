const router = require('express').Router();
const chat = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/conversations', chat.getConversations);
router.get('/dm/:userId', chat.getDirectMessages);
router.get('/group/:groupId', chat.getGroupMessages);

module.exports = router;
