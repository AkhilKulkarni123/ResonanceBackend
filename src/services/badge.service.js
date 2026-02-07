const { Badge, UserBadge, Dream, Feedback, DreamGroupMember, DreamArt, SleepLog } = require('../models');
const { Op } = require('sequelize');

async function calculateStreak(userId) {
  const dreams = await Dream.findAll({
    where: { user_id: userId },
    attributes: ['created_at'],
    order: [['created_at', 'DESC']],
  });

  if (dreams.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDreamDate = new Date(dreams[0].created_at);
  firstDreamDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - firstDreamDate) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  const dates = [...new Set(dreams.map((d) => {
    const date = new Date(d.created_at);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }))].sort((a, b) => b - a);

  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

async function checkCriteria(userId, criteria) {
  switch (criteria.type) {
    case 'dream_count': {
      const count = await Dream.count({ where: { user_id: userId } });
      return count >= criteria.threshold;
    }
    case 'streak': {
      const streak = await calculateStreak(userId);
      return streak >= criteria.threshold;
    }
    case 'group_count': {
      const count = await DreamGroupMember.count({ where: { user_id: userId } });
      return count >= criteria.threshold;
    }
    case 'feedback_count': {
      const count = await Feedback.count({ where: { user_id: userId } });
      return count >= criteria.threshold;
    }
    case 'accurate_predictions': {
      const count = await Feedback.count({
        where: { user_id: userId, prediction_accuracy: { [Op.gte]: 4 } },
      });
      return count >= criteria.threshold;
    }
    case 'art_count': {
      const dreams = await Dream.findAll({ where: { user_id: userId }, attributes: ['id'] });
      const dreamIds = dreams.map((d) => d.id);
      if (dreamIds.length === 0) return false;
      const count = await DreamArt.count({ where: { dream_id: { [Op.in]: dreamIds } } });
      return count >= criteria.threshold;
    }
    case 'sleep_log_count': {
      const count = await SleepLog.count({ where: { user_id: userId } });
      return count >= criteria.threshold;
    }
    default:
      return false;
  }
}

async function evaluateBadges(userId) {
  const badges = await Badge.findAll();
  const userBadges = await UserBadge.findAll({ where: { user_id: userId } });
  const earnedIds = new Set(userBadges.map((ub) => ub.badge_id));
  const newBadges = [];

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;
    if (!badge.criteria) continue;
    const earned = await checkCriteria(userId, badge.criteria);
    if (earned) {
      await UserBadge.create({ user_id: userId, badge_id: badge.id });
      newBadges.push(badge);
    }
  }

  return newBadges;
}

module.exports = { evaluateBadges, calculateStreak };
