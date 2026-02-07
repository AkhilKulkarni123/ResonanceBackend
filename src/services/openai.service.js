const openai = require('../config/openai');

function formatLifeContext(context) {
  if (!context || !context.questionnaire_answers) return 'No life context provided.';
  const a = context.questionnaire_answers;
  const parts = [];
  if (a.current_mood) parts.push(`Current mood: ${a.current_mood}/10`);
  if (a.dominant_emotions) parts.push(`Dominant emotions: ${Array.isArray(a.dominant_emotions) ? a.dominant_emotions.join(', ') : a.dominant_emotions}`);
  if (a.stress_level) parts.push(`Stress level: ${a.stress_level}/10`);
  if (a.recent_significant_event) parts.push(`Recent event: ${a.recent_significant_event}`);
  if (a.life_changes) parts.push(`Life changes: ${Array.isArray(a.life_changes) ? a.life_changes.join(', ') : a.life_changes}`);
  if (a.relationship_status) parts.push(`Relationship: ${a.relationship_status}`);
  if (a.relationship_concern) parts.push(`Relationship concern: ${a.relationship_concern}`);
  if (a.current_goals) parts.push(`Goals: ${a.current_goals}`);
  if (a.biggest_worry) parts.push(`Biggest worry: ${a.biggest_worry}`);
  if (a.sleep_quality_lately) parts.push(`Recent sleep quality: ${a.sleep_quality_lately}/5`);
  return parts.join('\n') || 'No details provided.';
}

function formatPreviousDreams(dreams) {
  if (!dreams || dreams.length === 0) return 'No previous dreams recorded.';
  return dreams
    .map((d, i) => {
      const themes = d.analysis?.themes?.join(', ') || 'unknown';
      const mood = d.mood || 'unknown';
      return `${i + 1}. "${d.title || 'Untitled'}" (mood: ${mood}, themes: ${themes}) - ${d.transcript?.substring(0, 100)}...`;
    })
    .join('\n');
}

function formatFeedbackHistory(feedback) {
  if (!feedback || feedback.length === 0) return 'No prediction feedback yet.';
  const avg = feedback.reduce((sum, f) => sum + (f.prediction_accuracy || 0), 0) / feedback.length;
  const details = feedback
    .slice(0, 5)
    .map((f) => `Accuracy: ${f.prediction_accuracy}/5 - ${f.outcome_description || 'No details'}`)
    .join('\n');
  return `Average prediction accuracy: ${avg.toFixed(1)}/5\nRecent feedback:\n${details}`;
}

async function analyzeDream(transcript, lifeContext, previousDreams = [], feedbackHistory = []) {
  const avgAccuracy = feedbackHistory.length > 0
    ? feedbackHistory.reduce((sum, f) => sum + (f.prediction_accuracy || 0), 0) / feedbackHistory.length
    : null;

  let predictionGuidance = '';
  if (avgAccuracy !== null && avgAccuracy < 2.5) {
    predictionGuidance = '\nIMPORTANT: Previous predictions have not been very accurate. Focus more on emotional insights, psychological patterns, and actionable guidance rather than specific event predictions.';
  }

  const systemPrompt = `You are Resonance, an expert dream analyst combining Jungian psychology, modern neuroscience, cultural symbolism, and personal context analysis. You provide deep, empathetic, and insightful dream interpretations. Always respond with valid JSON.${predictionGuidance}`;

  const userPrompt = `## Dream Transcript
${transcript}

## Life Context
${formatLifeContext(lifeContext)}

## Previous Dreams (for recurring theme detection)
${formatPreviousDreams(previousDreams)}

## Previous Prediction Feedback
${formatFeedbackHistory(feedbackHistory)}

Analyze this dream and provide your response as JSON with exactly these fields:
{
  "summary": "2-3 sentence dream summary capturing the key narrative",
  "symbols": [{"symbol": "name", "meaning": "universal meaning", "personal_relevance": "how it connects to this person's life context"}],
  "emotional_analysis": {
    "dominant_emotions": ["emotion1", "emotion2"],
    "emotional_arc": "how emotions progressed through the dream",
    "connection_to_waking_life": "how dream emotions relate to current life situation"
  },
  "themes": ["theme1", "theme2"],
  "recurring_patterns": [{"theme": "pattern name", "frequency": "how often seen", "evolution": "how it has changed over time"}],
  "prediction": {
    "short_term": "what feelings or situations may surface in the next few days",
    "medium_term": "patterns that may develop over the coming weeks",
    "guidance": "practical, actionable advice based on the dream",
    "confidence": 0.7
  },
  "cultural_references": ["relevant cultural or mythological connections"],
  "overall_interpretation": "A detailed 2-3 paragraph interpretation weaving together all elements"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { analyzeDream };
