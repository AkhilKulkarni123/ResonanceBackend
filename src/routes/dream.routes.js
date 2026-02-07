const router = require('express').Router();
const dream = require('../controllers/dream.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createDream, updateDream } = require('../validators/dream.validator');
const upload = require('../config/multer');

router.use(authMiddleware);

router.post('/upload', upload.single('media'), dream.upload);
router.post('/', createDream, validate, dream.create);
router.get('/', dream.getAll);
router.get('/featured', dream.getFeatured);
router.get('/:id', dream.getOne);
router.put('/:id', updateDream, validate, dream.update);
router.delete('/:id', dream.delete);

module.exports = router;
