const router = require('express').Router();
const sleep = require('../controllers/sleep.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', sleep.create);
router.get('/', sleep.getAll);
router.put('/:id', sleep.update);
router.delete('/:id', sleep.delete);

module.exports = router;
