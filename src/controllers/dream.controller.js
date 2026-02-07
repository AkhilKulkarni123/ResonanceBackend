const { Dream, LifeContext, Feedback, DreamArt, User } = require('../models');
const { transcribeAudio } = require('../services/transcription.service');
const { paginate } = require('../utils/helpers');
const ApiError = require('../utils/apiError');
const { evaluateBadges } = require('../services/badge.service');
const { Op } = require('sequelize');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) throw ApiError.badRequest('No file uploaded');

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    let transcript = '';
    try {
      transcript = await transcribeAudio(filePath);
    } catch (err) {
      console.error('Transcription failed:', err.message);
      // Continue without transcription - user can type manually
    }

    const dream = await Dream.create({
      user_id: req.user.id,
      transcript,
      video_url: req.file.mimetype.startsWith('video') ? fileUrl : null,
      audio_url: fileUrl,
    });

    res.status(201).json({
      dream_id: dream.id,
      transcript,
      video_url: dream.video_url,
      audio_url: dream.audio_url,
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, transcript, mood, categories, tags } = req.body;
    if (!transcript) throw ApiError.badRequest('Dream transcript is required');

    const dream = await Dream.create({
      user_id: req.user.id,
      title,
      transcript,
      mood,
      categories: categories || [],
      tags: tags || [],
    });

    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ dream });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = { user_id: req.user.id };

    if (req.query.mood) where.mood = req.query.mood;
    if (req.query.category) where.categories = { [Op.contains]: [req.query.category] };
    if (req.query.tag) where.tags = { [Op.contains]: [req.query.tag] };
    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${req.query.search}%` } },
        { transcript: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.date_from) where.created_at = { ...where.created_at, [Op.gte]: new Date(req.query.date_from) };
    if (req.query.date_to) where.created_at = { ...where.created_at, [Op.lte]: new Date(req.query.date_to) };

    const { rows: dreams, count: total } = await Dream.findAndCountAll({
      where,
      order: [[req.query.sort === 'date_asc' ? 'created_at' : 'created_at', req.query.sort === 'date_asc' ? 'ASC' : 'DESC']],
      limit,
      offset,
      include: [{ model: Feedback, attributes: ['prediction_accuracy'] }],
    });

    res.json({ dreams, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const dream = await Dream.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        { model: LifeContext },
        { model: Feedback },
        { model: DreamArt },
      ],
    });
    if (!dream) throw ApiError.notFound('Dream not found');
    res.json({ dream });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const dream = await Dream.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!dream) throw ApiError.notFound('Dream not found');

    const { title, transcript, mood, categories, tags, is_public } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (transcript !== undefined) updates.transcript = transcript;
    if (mood !== undefined) updates.mood = mood;
    if (categories !== undefined) updates.categories = categories;
    if (tags !== undefined) updates.tags = tags;
    if (is_public !== undefined) updates.is_public = is_public;

    await dream.update(updates);
    res.json({ dream });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const dream = await Dream.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!dream) throw ApiError.notFound('Dream not found');
    await dream.destroy();
    res.json({ message: 'Dream deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const dream = await Dream.findOne({
      where: { is_featured: true, is_public: true },
      order: [['updated_at', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] },
        { model: DreamArt },
      ],
    });
    res.json({ dream });
  } catch (err) {
    next(err);
  }
};
