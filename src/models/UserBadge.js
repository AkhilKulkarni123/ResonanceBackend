'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserBadge = sequelize.define('UserBadge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    badge_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'badges', key: 'id' },
    },
  }, {
    tableName: 'user_badges',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'badge_id'] },
    ],
  });

  return UserBadge;
};
