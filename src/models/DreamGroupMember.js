'use strict';

module.exports = (sequelize, DataTypes) => {
  const DreamGroupMember = sequelize.define('DreamGroupMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dream_group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'dream_groups', key: 'id' },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM('member', 'admin'),
      defaultValue: 'member',
    },
  }, {
    tableName: 'dream_group_members',
    underscored: true,
    indexes: [
      { unique: true, fields: ['dream_group_id', 'user_id'] },
    ],
  });

  return DreamGroupMember;
};
