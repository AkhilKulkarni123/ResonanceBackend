'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('badges', [
      {
        id: uuidv4(),
        name: 'First Dream',
        description: 'Record your first dream',
        icon: 'star',
        criteria: JSON.stringify({ type: 'dream_count', threshold: 1 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Dream Keeper',
        description: 'Record 10 dreams',
        icon: 'book',
        criteria: JSON.stringify({ type: 'dream_count', threshold: 10 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Lucid Logger',
        description: 'Record 50 dreams',
        icon: 'moon',
        criteria: JSON.stringify({ type: 'dream_count', threshold: 50 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Perfect Streak',
        description: 'Log dreams for 7 consecutive days',
        icon: 'flame',
        criteria: JSON.stringify({ type: 'streak', threshold: 7 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Dream Socialite',
        description: 'Join 3 dream groups',
        icon: 'users',
        criteria: JSON.stringify({ type: 'group_count', threshold: 3 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Oracle',
        description: 'Have 5 predictions rated 4+ stars',
        icon: 'eye',
        criteria: JSON.stringify({ type: 'accurate_predictions', threshold: 5 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Dream Artist',
        description: 'Generate 5 dream artworks',
        icon: 'palette',
        criteria: JSON.stringify({ type: 'art_count', threshold: 5 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Night Owl',
        description: 'Log sleep for 30 days',
        icon: 'bed',
        criteria: JSON.stringify({ type: 'sleep_log_count', threshold: 30 }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('badges', null, {});
  },
};
