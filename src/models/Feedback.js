'use strict';

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dream_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'dreams', key: 'id' },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    prediction_accuracy: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
    },
    outcome_description: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'feedback',
    underscored: true,
  });

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.Dream, { foreignKey: 'dream_id' });
    Feedback.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Feedback;
};
