const { User } = require('../models');
const { generateToken, sanitizeUser } = require('../utils/helpers');
const ApiError = require('../utils/apiError');

exports.signup = async (req, res, next) => {
  try {
    const { email, password, username, display_name } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw ApiError.badRequest('Email already registered');

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) throw ApiError.badRequest('Username already taken');

    const user = await User.create({
      email,
      password_hash: password,
      username,
      display_name: display_name || username,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const valid = await user.validPassword(password);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    const token = generateToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { display_name, bio, avatar_url, is_anonymous } = req.body;
    const updates = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (is_anonymous !== undefined) updates.is_anonymous = is_anonymous;

    await req.user.update(updates);
    res.json({ user: sanitizeUser(req.user) });
  } catch (err) {
    next(err);
  }
};
