const { Feedback, Dream } = require('../models');
const { evaluateBadges } = require('../services/badge.service');
const ApiError = require('../utils/apiError');

exports.create = async (req, res, next) => {
  try {
    const { dream_id, prediction_accuracy, outcome_description } = req.body;

    const dream = await Dream.findOne({ where: { id: dream_id, user_id: req.user.id } });
    if (!dream) throw ApiError.notFound('Dream not found');
    if (!dream.prediction) throw ApiError.badRequest('This dream has no prediction to give feedback on');

    const existing = await Feedback.findOne({ where: { dream_id, user_id: req.user.id } });
    if (existing) throw ApiError.badRequest('Feedback already submitted for this dream');

    const feedback = await Feedback.create({
      dream_id,
      user_id: req.user.id,
      prediction_accuracy,
      outcome_description,
    });

    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ feedback });
  } catch (err) {
    next(err);
  }
};

exports.getByDream = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({
      where: { dream_id: req.params.dreamId, user_id: req.user.id },
    });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const feedback = await Feedback.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      include: [{ model: Dream, attributes: ['id', 'title', 'mood'] }],
    });
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
};
