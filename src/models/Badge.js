'use strict';

module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define('Badge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    icon: {
      type: DataTypes.STRING,
    },
    criteria: {
      type: DataTypes.JSONB,
    },
  }, {
    tableName: 'badges',
    underscored: true,
  });

  Badge.associate = (models) => {
    Badge.belongsToMany(models.User, { through: models.UserBadge, foreignKey: 'badge_id' });
  };

  return Badge;
};
