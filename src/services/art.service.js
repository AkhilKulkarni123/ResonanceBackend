const openai = require('../config/openai');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

function buildArtPrompt(transcript, symbols, style) {
  const symbolList = symbols && symbols.length > 0
    ? symbols.map((s) => s.symbol).join(', ')
    : 'abstract dreamlike elements';

  const styleMap = {
    'surrealist': 'Salvador Dali-inspired surrealist',
    'watercolor': 'delicate watercolor painting',
    'digital': 'modern digital art',
    'anime': 'anime-inspired illustration',
    'abstract': 'abstract expressionist',
    'oil-painting': 'classical oil painting',
  };

  const styleDesc = styleMap[style] || 'surrealist';

  return `Create a ${styleDesc} dream artwork inspired by: "${transcript.substring(0, 200)}". Key symbols: ${symbolList}. Dreamlike, ethereal, mysterious atmosphere. Rich colors and symbolic imagery. No text, words, or letters in the image.`;
}

async function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function generateDreamArt(transcript, analysisSymbols, style = 'surrealist') {
  const prompt = buildArtPrompt(transcript, analysisSymbols, style);

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  const tempUrl = response.data[0].url;
  const filename = `dream-art-${uuidv4()}.png`;
  const destPath = path.join('uploads', filename);

  await downloadImage(tempUrl, destPath);

  return { imageUrl: `/uploads/${filename}`, promptUsed: prompt };
}

module.exports = { generateDreamArt };
