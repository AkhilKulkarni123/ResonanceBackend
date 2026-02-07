const fs = require('fs');
const openai = require('../config/openai');

async function transcribeAudio(filePath) {
  const file = fs.createReadStream(filePath);
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    response_format: 'text',
  });
  return response;
}

module.exports = { transcribeAudio };
