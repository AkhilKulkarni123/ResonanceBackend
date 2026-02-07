const { SleepLog } = require('../models');
const { evaluateBadges } = require('../services/badge.service');
const ApiError = require('../utils/apiError');
const { Op } = require('sequelize');

exports.create = async (req, res, next) => {
  try {
    const { date, quality, hours, notes } = req.body;

    const existing = await SleepLog.findOne({
      where: { user_id: req.user.id, date },
    });
    if (existing) throw ApiError.badRequest('Sleep log already exists for this date');

    const log = await SleepLog.create({
      user_id: req.user.id,
      date,
      quality,
      hours,
      notes,
    });

    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ log });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const where = { user_id: req.user.id };
    if (req.query.from) where.date = { ...where.date, [Op.gte]: req.query.from };
    if (req.query.to) where.date = { ...where.date, [Op.lte]: req.query.to };

    const logs = await SleepLog.findAll({
      where,
      order: [['date', 'DESC']],
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const log = await SleepLog.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!log) throw ApiError.notFound('Sleep log not found');

    const { quality, hours, notes } = req.body;
    const updates = {};
    if (quality !== undefined) updates.quality = quality;
    if (hours !== undefined) updates.hours = hours;
    if (notes !== undefined) updates.notes = notes;

    await log.update(updates);
    res.json({ log });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const log = await SleepLog.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!log) throw ApiError.notFound('Sleep log not found');
    await log.destroy();
    res.json({ message: 'Sleep log deleted' });
  } catch (err) {
    next(err);
  }
};
