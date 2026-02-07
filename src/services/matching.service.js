const { Dream, User, Friendship } = require('../models');
const { Op } = require('sequelize');

async function buildDreamProfile(userId) {
  const dreams = await Dream.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: 20,
    attributes: ['analysis', 'mood', 'categories', 'tags'],
  });

  const themes = {};
  const moods = {};
  const categories = {};

  for (const dream of dreams) {
    if (dream.mood) moods[dream.mood] = (moods[dream.mood] || 0) + 1;
    if (dream.categories) {
      for (const cat of dream.categories) {
        categories[cat] = (categories[cat] || 0) + 1;
      }
    }
    if (dream.analysis?.themes) {
      for (const theme of dream.analysis.themes) {
        themes[theme] = (themes[theme] || 0) + 1;
      }
    }
  }

  return { themes, moods, categories, dreamCount: dreams.length };
}

function jaccardSimilarity(setA, setB) {
  const a = new Set(Object.keys(setA));
  const b = new Set(Object.keys(setB));
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function findMatchReason(profileA, profileB) {
  const sharedThemes = Object.keys(profileA.themes).filter((t) => profileB.themes[t]);
  if (sharedThemes.length > 0) return `Shared dream themes: ${sharedThemes.slice(0, 3).join(', ')}`;
  const sharedMoods = Object.keys(profileA.moods).filter((m) => profileB.moods[m]);
  if (sharedMoods.length > 0) return `Similar dream moods: ${sharedMoods.slice(0, 3).join(', ')}`;
  return 'Similar dream patterns';
}

async function findDreamMatches(userId, limit = 10) {
  const userProfile = await buildDreamProfile(userId);
  if (userProfile.dreamCount === 0) return [];

  const existingFriends = await Friendship.findAll({
    where: {
      [Op.or]: [{ user_id: userId }, { friend_id: userId }],
    },
    attributes: ['user_id', 'friend_id'],
  });

  const excludeIds = new Set([userId]);
  for (const f of existingFriends) {
    excludeIds.add(f.user_id);
    excludeIds.add(f.friend_id);
  }

  const otherUsers = await User.findAll({
    where: { id: { [Op.notIn]: [...excludeIds] } },
    attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous', 'bio'],
  });

  const matches = [];
  for (const user of otherUsers) {
    const otherProfile = await buildDreamProfile(user.id);
    if (otherProfile.dreamCount === 0) continue;

    const themeSim = jaccardSimilarity(userProfile.themes, otherProfile.themes);
    const moodSim = jaccardSimilarity(userProfile.moods, otherProfile.moods);
    const catSim = jaccardSimilarity(userProfile.categories, otherProfile.categories);
    const score = themeSim * 0.5 + moodSim * 0.3 + catSim * 0.2;

    if (score > 0.1) {
      matches.push({
        user: user.is_anonymous
          ? { id: user.id, username: 'Anonymous Dreamer', is_anonymous: true }
          : user,
        score,
        match_reason: findMatchReason(userProfile, otherProfile),
      });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { findDreamMatches, buildDreamProfile };
