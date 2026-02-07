'use strict';

module.exports = (sequelize, DataTypes) => {
  const SleepLog = sequelize.define('SleepLog', {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    quality: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    hours: {
      type: DataTypes.DECIMAL(4, 2),
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'sleep_logs',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'date'] },
    ],
  });

  SleepLog.associate = (models) => {
    SleepLog.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return SleepLog;
};
