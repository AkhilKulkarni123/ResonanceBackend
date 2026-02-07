'use strict';

module.exports = (sequelize, DataTypes) => {
  const DreamArt = sequelize.define('DreamArt', {
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
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prompt_used: {
      type: DataTypes.TEXT,
    },
    style: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'dream_art',
    underscored: true,
  });

  DreamArt.associate = (models) => {
    DreamArt.belongsTo(models.Dream, { foreignKey: 'dream_id' });
  };

  return DreamArt;
};
