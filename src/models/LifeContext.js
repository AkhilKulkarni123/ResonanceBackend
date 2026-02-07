'use strict';

module.exports = (sequelize, DataTypes) => {
  const LifeContext = sequelize.define('LifeContext', {
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
    dream_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'dreams', key: 'id' },
    },
    questionnaire_answers: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'life_contexts',
    underscored: true,
  });

  LifeContext.associate = (models) => {
    LifeContext.belongsTo(models.User, { foreignKey: 'user_id' });
    LifeContext.belongsTo(models.Dream, { foreignKey: 'dream_id' });
  };

  return LifeContext;
};
