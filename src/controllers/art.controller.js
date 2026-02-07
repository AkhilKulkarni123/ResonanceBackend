const { Dream, DreamArt } = require('../models');
const { generateDreamArt } = require('../services/art.service');
const { evaluateBadges } = require('../services/badge.service');
const ApiError = require('../utils/apiError');

exports.generate = async (req, res, next) => {
  try {
    const { dream_id, style } = req.body;

    const dream = await Dream.findOne({ where: { id: dream_id, user_id: req.user.id } });
    if (!dream) throw ApiError.notFound('Dream not found');
    if (!dream.transcript) throw ApiError.badRequest('Dream has no transcript');

    const symbols = dream.analysis?.symbols || [];
    const { imageUrl, promptUsed } = await generateDreamArt(dream.transcript, symbols, style);

    const art = await DreamArt.create({
      dream_id,
      image_url: imageUrl,
      prompt_used: promptUsed,
      style: style || 'surrealist',
    });

    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ art });
  } catch (err) {
    next(err);
  }
};

exports.getByDream = async (req, res, next) => {
  try {
    const art = await DreamArt.findAll({
      where: { dream_id: req.params.dreamId },
      order: [['created_at', 'DESC']],
    });
    res.json({ art });
  } catch (err) {
    next(err);
  }
};

exports.getGallery = async (req, res, next) => {
  try {
    const art = await DreamArt.findAll({
      include: [{
        model: Dream,
        where: { is_public: true },
        attributes: ['id', 'title', 'mood'],
      }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ art });
  } catch (err) {
    next(err);
  }
};
