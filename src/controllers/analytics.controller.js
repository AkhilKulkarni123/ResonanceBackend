const { Dream, Feedback, SleepLog, UserBadge, Badge } = require('../models');
const { calculateStreak } = require('../services/badge.service');
const { Op, fn, col, literal } = require('sequelize');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const dreamCount = await Dream.count({ where: { user_id: userId } });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dreamsThisMonth = await Dream.count({
      where: { user_id: userId, created_at: { [Op.gte]: monthStart } },
    });

    const currentStreak = await calculateStreak(userId);

    // Mood distribution
    const moodDist = await Dream.findAll({
      where: { user_id: userId, mood: { [Op.ne]: null } },
      attributes: ['mood', [fn('COUNT', col('mood')), 'count']],
      group: ['mood'],
      raw: true,
    });
    const moodDistribution = {};
    moodDist.forEach((m) => { moodDistribution[m.mood] = parseInt(m.count); });

    // Mood over time (last 30 dreams)
    const moodOverTime = await Dream.findAll({
      where: { user_id: userId, mood: { [Op.ne]: null } },
      attributes: ['created_at', 'mood'],
      order: [['created_at', 'DESC']],
      limit: 30,
      raw: true,
    });

    // Top themes from analysis
    const dreamsWithAnalysis = await Dream.findAll({
      where: { user_id: userId, analysis: { [Op.ne]: null } },
      attributes: ['analysis'],
      raw: true,
    });
    const themeCounts = {};
    dreamsWithAnalysis.forEach((d) => {
      const themes = d.analysis?.themes || [];
      themes.forEach((t) => { themeCounts[t] = (themeCounts[t] || 0) + 1; });
    });
    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    // Category distribution
    const dreamsWithCats = await Dream.findAll({
      where: { user_id: userId },
      attributes: ['categories'],
      raw: true,
    });
    const catCounts = {};
    dreamsWithCats.forEach((d) => {
      (d.categories || []).forEach((c) => { catCounts[c] = (catCounts[c] || 0) + 1; });
    });
    const topCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    // Prediction accuracy
    const feedbackStats = await Feedback.findAll({
      where: { user_id: userId },
      attributes: [[fn('AVG', col('prediction_accuracy')), 'avg'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });
    const predictionAccuracyAvg = feedbackStats[0]?.avg ? parseFloat(feedbackStats[0].avg).toFixed(1) : null;

    // Sleep stats
    const sleepStats = await SleepLog.findAll({
      where: { user_id: userId },
      attributes: [
        [fn('AVG', col('quality')), 'avg_quality'],
        [fn('AVG', col('hours')), 'avg_hours'],
      ],
      raw: true,
    });

    const sleepOverTime = await SleepLog.findAll({
      where: { user_id: userId },
      order: [['date', 'DESC']],
      limit: 30,
      attributes: ['date', 'quality', 'hours'],
      raw: true,
    });

    // Badges
    const userBadges = await UserBadge.findAll({
      where: { user_id: userId },
      include: [Badge],
    });
    const totalBadges = await Badge.count();

    res.json({
      dream_count: dreamCount,
      dreams_this_month: dreamsThisMonth,
      current_streak: currentStreak,
      mood_distribution: moodDistribution,
      mood_over_time: moodOverTime.reverse(),
      top_themes: topThemes,
      top_categories: topCategories,
      prediction_accuracy_avg: predictionAccuracyAvg,
      feedback_count: parseInt(feedbackStats[0]?.count || 0),
      sleep_quality_avg: sleepStats[0]?.avg_quality ? parseFloat(sleepStats[0].avg_quality).toFixed(1) : null,
      sleep_hours_avg: sleepStats[0]?.avg_hours ? parseFloat(sleepStats[0].avg_hours).toFixed(1) : null,
      sleep_over_time: sleepOverTime.reverse(),
      badges_earned: userBadges.length,
      badges_total: totalBadges,
      badges: userBadges.map((ub) => ub.Badge),
    });
  } catch (err) {
    next(err);
  }
};
