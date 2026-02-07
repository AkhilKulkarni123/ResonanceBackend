'use strict';

module.exports = (sequelize, DataTypes) => {
  const DreamGroup = sequelize.define('DreamGroup', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    theme: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'dream_groups',
    underscored: true,
  });

  DreamGroup.associate = (models) => {
    DreamGroup.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by' });
    DreamGroup.belongsToMany(models.User, { through: models.DreamGroupMember, foreignKey: 'dream_group_id' });
    DreamGroup.hasMany(models.Message, { foreignKey: 'dream_group_id' });
    DreamGroup.hasMany(models.DreamGroupMember, { foreignKey: 'dream_group_id' });
  };

  return DreamGroup;
};
