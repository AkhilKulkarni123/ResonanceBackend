const { LifeContext, Dream, Feedback } = require('../models');
const { analyzeDream } = require('../services/openai.service');
const { evaluateBadges } = require('../services/badge.service');
const ApiError = require('../utils/apiError');

exports.create = async (req, res, next) => {
  try {
    const { dream_id, questionnaire_answers } = req.body;

    const dream = await Dream.findOne({ where: { id: dream_id, user_id: req.user.id } });
    if (!dream) throw ApiError.notFound('Dream not found');

    const existing = await LifeContext.findOne({ where: { dream_id } });
    if (existing) throw ApiError.badRequest('Life context already exists for this dream');

    const context = await LifeContext.create({
      user_id: req.user.id,
      dream_id,
      questionnaire_answers,
    });

    // Trigger AI analysis
    const previousDreams = await Dream.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['title', 'transcript', 'analysis', 'mood'],
    });

    const feedbackHistory = await Feedback.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['prediction_accuracy', 'outcome_description'],
    });

    try {
      const analysis = await analyzeDream(
        dream.transcript,
        context,
        previousDreams,
        feedbackHistory
      );

      await dream.update({
        analysis,
        prediction: analysis.prediction,
        title: dream.title || analysis.summary?.substring(0, 100) || 'Untitled Dream',
      });
    } catch (aiErr) {
      console.error('AI analysis failed:', aiErr.message);
      // Don't fail the whole request if AI is unavailable
    }

    await dream.reload({ include: [LifeContext] });
    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ dream });
  } catch (err) {
    next(err);
  }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const { LIFE_CONTEXT_QUESTIONS } = require('../utils/constants');
    res.json({ questions: LIFE_CONTEXT_QUESTIONS });
  } catch (err) {
    next(err);
  }
};
