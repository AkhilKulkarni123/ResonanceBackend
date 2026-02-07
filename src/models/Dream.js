'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dream = sequelize.define('Dream', {
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
    title: {
      type: DataTypes.STRING,
    },
    transcript: {
      type: DataTypes.TEXT,
    },
    video_url: {
      type: DataTypes.STRING,
    },
    audio_url: {
      type: DataTypes.STRING,
    },
    analysis: {
      type: DataTypes.JSONB,
    },
    prediction: {
      type: DataTypes.JSONB,
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    mood: {
      type: DataTypes.ENUM('happy', 'sad', 'anxious', 'neutral', 'fearful', 'excited', 'confused', 'peaceful'),
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'dreams',
    underscored: true,
  });

  Dream.associate = (models) => {
    Dream.belongsTo(models.User, { foreignKey: 'user_id' });
    Dream.hasOne(models.LifeContext, { foreignKey: 'dream_id' });
    Dream.hasMany(models.Feedback, { foreignKey: 'dream_id' });
    Dream.hasMany(models.DreamArt, { foreignKey: 'dream_id' });
  };

  return Dream;
};
