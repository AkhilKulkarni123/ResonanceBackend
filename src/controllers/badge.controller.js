const { Badge, UserBadge } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const badges = await Badge.findAll({ order: [['name', 'ASC']] });
    const userBadges = await UserBadge.findAll({ where: { user_id: req.user.id } });
    const earnedIds = new Set(userBadges.map((ub) => ub.badge_id));

    const result = badges.map((b) => ({
      ...b.toJSON(),
      earned: earnedIds.has(b.id),
      earned_at: userBadges.find((ub) => ub.badge_id === b.id)?.created_at || null,
    }));

    res.json({ badges: result });
  } catch (err) {
    next(err);
  }
};
