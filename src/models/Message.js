'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    receiver_id: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' },
    },
    dream_group_id: {
      type: DataTypes.UUID,
      references: { model: 'dream_groups', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'messages',
    underscored: true,
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { as: 'sender', foreignKey: 'sender_id' });
    Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiver_id' });
    Message.belongsTo(models.DreamGroup, { foreignKey: 'dream_group_id' });
  };

  return Message;
};
