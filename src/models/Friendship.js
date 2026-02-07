'use strict';

module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define('Friendship', {
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
    friend_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      defaultValue: 'pending',
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    match_reason: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'friendships',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'friend_id'] },
    ],
  });

  Friendship.associate = (models) => {
    Friendship.belongsTo(models.User, { as: 'requester', foreignKey: 'user_id' });
    Friendship.belongsTo(models.User, { as: 'receiver', foreignKey: 'friend_id' });
  };

  return Friendship;
};
