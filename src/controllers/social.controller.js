const { User, Friendship, DreamGroup, DreamGroupMember } = require('../models');
const { findDreamMatches } = require('../services/matching.service');
const { evaluateBadges } = require('../services/badge.service');
const { sanitizeUser } = require('../utils/helpers');
const ApiError = require('../utils/apiError');
const { Op } = require('sequelize');

// Friend Matching
exports.getSuggestions = async (req, res, next) => {
  try {
    const matches = await findDreamMatches(req.user.id);
    res.json({ matches });
  } catch (err) {
    next(err);
  }
};

// Friend Requests
exports.sendRequest = async (req, res, next) => {
  try {
    const { friend_id, is_anonymous } = req.body;
    if (friend_id === req.user.id) throw ApiError.badRequest('Cannot friend yourself');

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.id, friend_id },
          { user_id: friend_id, friend_id: req.user.id },
        ],
      },
    });
    if (existing) throw ApiError.badRequest('Friendship already exists');

    const friendship = await Friendship.create({
      user_id: req.user.id,
      friend_id,
      is_anonymous: is_anonymous || req.user.is_anonymous,
      match_reason: req.body.match_reason,
    });

    res.status(201).json({ friendship });
  } catch (err) {
    next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      where: { id: req.params.id, friend_id: req.user.id, status: 'pending' },
    });
    if (!friendship) throw ApiError.notFound('Friend request not found');

    await friendship.update({ status: 'accepted' });
    res.json({ friendship });
  } catch (err) {
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      where: { id: req.params.id, friend_id: req.user.id, status: 'pending' },
    });
    if (!friendship) throw ApiError.notFound('Friend request not found');

    await friendship.destroy();
    res.json({ message: 'Request rejected' });
  } catch (err) {
    next(err);
  }
};

exports.removeFriend = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.id, friend_id: req.params.id },
          { user_id: req.params.id, friend_id: req.user.id },
        ],
        status: 'accepted',
      },
    });
    if (!friendship) throw ApiError.notFound('Friendship not found');

    await friendship.destroy();
    res.json({ message: 'Friend removed' });
  } catch (err) {
    next(err);
  }
};

exports.getFriends = async (req, res, next) => {
  try {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [{ user_id: req.user.id }, { friend_id: req.user.id }],
        status: 'accepted',
      },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous', 'bio'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous', 'bio'] },
      ],
    });

    const friends = friendships.map((f) => {
      const friend = f.user_id === req.user.id ? f.receiver : f.requester;
      return {
        friendship_id: f.id,
        is_anonymous: f.is_anonymous,
        match_reason: f.match_reason,
        user: f.is_anonymous
          ? { id: friend.id, username: 'Anonymous Dreamer', is_anonymous: true }
          : friend,
      };
    });

    res.json({ friends });
  } catch (err) {
    next(err);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await Friendship.findAll({
      where: { friend_id: req.user.id, status: 'pending' },
      include: [
        { model: User, as: 'requester', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] },
      ],
    });
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

// Dream Groups
exports.createGroup = async (req, res, next) => {
  try {
    const { name, theme, description, is_public } = req.body;
    const group = await DreamGroup.create({
      name,
      theme,
      description,
      is_public: is_public !== false,
      created_by: req.user.id,
    });

    await DreamGroupMember.create({
      dream_group_id: group.id,
      user_id: req.user.id,
      role: 'admin',
    });

    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const where = { is_public: true };
    if (req.query.theme) where.theme = { [Op.iLike]: `%${req.query.theme}%` };

    const groups = await DreamGroup.findAll({
      where,
      include: [
        { model: DreamGroupMember, attributes: ['id'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'display_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const result = groups.map((g) => ({
      ...g.toJSON(),
      member_count: g.DreamGroupMembers?.length || 0,
    }));

    res.json({ groups: result });
  } catch (err) {
    next(err);
  }
};

exports.getGroup = async (req, res, next) => {
  try {
    const group = await DreamGroup.findByPk(req.params.id, {
      include: [
        {
          model: DreamGroupMember,
          include: [{ model: User, attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] }],
        },
        { model: User, as: 'creator', attributes: ['id', 'username', 'display_name'] },
      ],
    });
    if (!group) throw ApiError.notFound('Group not found');
    res.json({ group });
  } catch (err) {
    next(err);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const group = await DreamGroup.findByPk(req.params.id);
    if (!group) throw ApiError.notFound('Group not found');

    const existing = await DreamGroupMember.findOne({
      where: { dream_group_id: group.id, user_id: req.user.id },
    });
    if (existing) throw ApiError.badRequest('Already a member');

    const member = await DreamGroupMember.create({
      dream_group_id: group.id,
      user_id: req.user.id,
      is_anonymous: req.body.is_anonymous || req.user.is_anonymous,
    });

    evaluateBadges(req.user.id).catch(console.error);

    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
};

exports.leaveGroup = async (req, res, next) => {
  try {
    const member = await DreamGroupMember.findOne({
      where: { dream_group_id: req.params.id, user_id: req.user.id },
    });
    if (!member) throw ApiError.notFound('Not a member');

    await member.destroy();
    res.json({ message: 'Left group' });
  } catch (err) {
    next(err);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const member = await DreamGroupMember.findOne({
      where: { dream_group_id: req.params.id, user_id: req.user.id, role: 'admin' },
    });
    if (!member) throw ApiError.forbidden('Only admins can update the group');

    const group = await DreamGroup.findByPk(req.params.id);
    const { name, theme, description, is_public } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (theme !== undefined) updates.theme = theme;
    if (description !== undefined) updates.description = description;
    if (is_public !== undefined) updates.is_public = is_public;

    await group.update(updates);
    res.json({ group });
  } catch (err) {
    next(err);
  }
};
