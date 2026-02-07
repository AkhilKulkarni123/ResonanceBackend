const { Message, User, DreamGroup, DreamGroupMember } = require('../models');
const { paginate } = require('../utils/helpers');
const ApiError = require('../utils/apiError');
const { Op } = require('sequelize');

exports.getConversations = async (req, res, next) => {
  try {
    // Get latest message per conversation partner
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id, dream_group_id: null },
          { receiver_id: req.user.id, dream_group_id: null },
        ],
      },
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] },
      ],
    });

    // Deduplicate to latest per partner
    const conversationMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.sender_id === req.user.id ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        const partner = msg.sender_id === req.user.id ? msg.receiver : msg.sender;
        conversationMap.set(partnerId, {
          partner,
          last_message: msg,
          unread: msg.receiver_id === req.user.id && !msg.read_at,
        });
      }
    }

    // Get group conversations
    const groupMemberships = await DreamGroupMember.findAll({
      where: { user_id: req.user.id },
      include: [{ model: DreamGroup }],
    });

    const groups = [];
    for (const membership of groupMemberships) {
      const lastMsg = await Message.findOne({
        where: { dream_group_id: membership.dream_group_id },
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'avatar_url'] }],
      });
      groups.push({
        group: membership.DreamGroup,
        last_message: lastMsg,
        is_anonymous: membership.is_anonymous,
      });
    }

    res.json({
      direct: [...conversationMap.values()],
      groups,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDirectMessages = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const partnerId = req.params.userId;

    const { rows: messages, count: total } = await Message.findAndCountAll({
      where: {
        dream_group_id: null,
        [Op.or]: [
          { sender_id: req.user.id, receiver_id: partnerId },
          { sender_id: partnerId, receiver_id: req.user.id },
        ],
      },
      order: [['created_at', 'DESC']],
      limit,
      offset,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] },
      ],
    });

    // Mark as read
    await Message.update(
      { read_at: new Date() },
      {
        where: {
          sender_id: partnerId,
          receiver_id: req.user.id,
          read_at: null,
        },
      }
    );

    res.json({ messages: messages.reverse(), total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getGroupMessages = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const groupId = req.params.groupId;

    const member = await DreamGroupMember.findOne({
      where: { dream_group_id: groupId, user_id: req.user.id },
    });
    if (!member) throw ApiError.forbidden('Not a member of this group');

    const { rows: messages, count: total } = await Message.findAndCountAll({
      where: { dream_group_id: groupId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'display_name', 'avatar_url', 'is_anonymous'] },
      ],
    });

    res.json({ messages: messages.reverse(), total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
