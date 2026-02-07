const router = require('express').Router();
const social = require('../controllers/social.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Friend matching
router.get('/suggestions', social.getSuggestions);

// Friend requests
router.post('/request', social.sendRequest);
router.put('/request/:id/accept', social.acceptRequest);
router.put('/request/:id/reject', social.rejectRequest);
router.get('/requests', social.getRequests);

// Friends
router.get('/friends', social.getFriends);
router.delete('/friends/:id', social.removeFriend);

// Dream groups
router.post('/groups', social.createGroup);
router.get('/groups', social.getGroups);
router.get('/groups/:id', social.getGroup);
router.post('/groups/:id/join', social.joinGroup);
router.delete('/groups/:id/leave', social.leaveGroup);
router.put('/groups/:id', social.updateGroup);

module.exports = router;
