const MOODS = ['happy', 'sad', 'anxious', 'neutral', 'fearful', 'excited', 'confused', 'peaceful'];

const FRIENDSHIP_STATUS = ['pending', 'accepted', 'blocked'];

const GROUP_ROLES = ['member', 'admin'];

const DREAM_CATEGORIES = [
  'flying', 'falling', 'chase', 'water', 'death', 'teeth',
  'being-late', 'naked-in-public', 'lost', 'trapped',
  'animals', 'supernatural', 'travel', 'work', 'school',
  'family', 'romance', 'nightmare', 'lucid', 'recurring', 'other',
];

const ART_STYLES = ['surrealist', 'watercolor', 'digital', 'anime', 'abstract', 'oil-painting'];

const BADGE_CRITERIA_TYPES = [
  'dream_count', 'streak', 'group_count', 'feedback_count',
  'art_count', 'sleep_log_count', 'accurate_predictions',
];

const LIFE_CONTEXT_QUESTIONS = {
  step1: {
    title: 'Emotional State',
    questions: [
      { key: 'current_mood', label: 'How are you feeling today?', type: 'scale', min: 1, max: 10 },
      { key: 'mood_duration', label: 'How long have you felt this way?', type: 'select', options: ['Just today', 'A few days', 'About a week', 'Weeks', 'Months'] },
      { key: 'dominant_emotions', label: 'Select your dominant emotions', type: 'multiselect', options: ['anxious', 'happy', 'sad', 'angry', 'confused', 'hopeful', 'nostalgic', 'fearful', 'excited', 'numb'] },
    ],
  },
  step2: {
    title: 'Recent Events',
    questions: [
      { key: 'recent_significant_event', label: 'Has anything significant happened recently?', type: 'textarea' },
      { key: 'life_changes', label: 'Any recent life changes?', type: 'multiselect', options: ['new job', 'relationship change', 'loss', 'move', 'health issue', 'financial change', 'none'] },
      { key: 'stress_level', label: 'Current stress level', type: 'scale', min: 1, max: 10 },
    ],
  },
  step3: {
    title: 'Relationships',
    questions: [
      { key: 'relationship_status', label: 'Relationship status', type: 'select', options: ['Single', 'In a relationship', 'Married', 'Complicated', 'Prefer not to say'] },
      { key: 'relationship_concern', label: 'Any relationship on your mind?', type: 'textarea', optional: true },
      { key: 'social_satisfaction', label: 'Social life satisfaction', type: 'scale', min: 1, max: 5 },
    ],
  },
  step4: {
    title: 'Goals & Concerns',
    questions: [
      { key: 'current_goals', label: 'What are you working toward?', type: 'textarea' },
      { key: 'biggest_worry', label: 'What worries you most right now?', type: 'textarea' },
      { key: 'sleep_quality_lately', label: 'Recent sleep quality', type: 'scale', min: 1, max: 5 },
    ],
  },
};

module.exports = {
  MOODS,
  FRIENDSHIP_STATUS,
  GROUP_ROLES,
  DREAM_CATEGORIES,
  ART_STYLES,
  BADGE_CRITERIA_TYPES,
  LIFE_CONTEXT_QUESTIONS,
};
