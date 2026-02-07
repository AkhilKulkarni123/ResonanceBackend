'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING,
    },
    avatar_url: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  });

  User.prototype.validPassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.associate = (models) => {
    User.hasMany(models.Dream, { foreignKey: 'user_id' });
    User.hasMany(models.SleepLog, { foreignKey: 'user_id' });
    User.hasMany(models.Feedback, { foreignKey: 'user_id' });
    User.belongsToMany(models.Badge, { through: models.UserBadge, foreignKey: 'user_id' });
    User.belongsToMany(models.DreamGroup, { through: models.DreamGroupMember, foreignKey: 'user_id' });
  };

  return User;
};
