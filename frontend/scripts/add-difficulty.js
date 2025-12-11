import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the emoji data
const emojiDataPath = path.join(__dirname, '../public/emojis.json');
const emojiData = JSON.parse(fs.readFileSync(emojiDataPath, 'utf8'));

// Define difficulty rules
function calculateDifficulty(emoji) {
  const { name, keywords = [] } = emoji;

  // Common/easy emojis (difficulty 1)
  const commonPatterns = [
    'smiling face', 'grinning face', 'face with', 'red heart', 'thumbs up',
    'thumbs down', 'waving hand', 'ok hand', 'star', 'sun', 'cloud',
    'fire', 'party', 'birthday', 'christmas', 'cat', 'dog', 'heart'
  ];

  // Complex/hard emojis (difficulty 3)
  const complexPatterns = [
    'flag:', 'keycap', 'skin tone', 'zodiac', 'kanji', 'ideograph',
    'squared', 'button:', 'arrow:', 'symbol', 'geometric', 'alchemical'
  ];

  // Check for common emojis
  for (const pattern of commonPatterns) {
    if (name.toLowerCase().includes(pattern)) {
      return 1; // Easy
    }
  }

  // Check for complex emojis
  for (const pattern of complexPatterns) {
    if (name.toLowerCase().includes(pattern)) {
      return 3; // Hard
    }
  }

  // Additional rules
  if (name.length > 30) return 3; // Long names are harder
  if (name.split(' ').length > 4) return 3; // Many words = complex
  if (keywords.length === 0) return 3; // No keywords = harder to guess
  if (keywords.length > 5) return 1; // Many keywords = easier

  // Default to medium difficulty
  return 2;
}

// Add difficulty to each emoji
const updatedEmojis = emojiData.emojis.map(emoji => ({
  ...emoji,
  difficulty: emoji.difficulty || calculateDifficulty(emoji)
}));

// Save the updated data
const updatedData = { emojis: updatedEmojis };
fs.writeFileSync(emojiDataPath, JSON.stringify(updatedData, null, 2));

console.log('Difficulty levels added to emojis!');
console.log(`Total emojis: ${updatedEmojis.length}`);
console.log(`Easy (1): ${updatedEmojis.filter(e => e.difficulty === 1).length}`);
console.log(`Medium (2): ${updatedEmojis.filter(e => e.difficulty === 2).length}`);
console.log(`Hard (3): ${updatedEmojis.filter(e => e.difficulty === 3).length}`);