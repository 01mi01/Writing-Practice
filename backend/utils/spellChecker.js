const Typo = require('typo-js');
const fs = require('fs');
const path = require('path');

let dictionary = null;

const initializeDictionary = () => {
  if (!dictionary) {
    const affPath = path.join(__dirname, '../dictionaries/en_US.aff');
    const dicPath = path.join(__dirname, '../dictionaries/en_US.dic');
    
    const affData = fs.readFileSync(affPath, 'utf-8');
    const dicData = fs.readFileSync(dicPath, 'utf-8');
    
    dictionary = new Typo('en_US', affData, dicData);
  }
  return dictionary;
};

const checkSpelling = (text, userVocabulary = []) => {
  const dict = initializeDictionary();
  
  // Normalize user vocabulary to lowercase for case-insensitive comparison
  const vocabSet = new Set(userVocabulary.map(word => word.toLowerCase()));
  
  // Remove ALL punctuation and symbols, keep only letters, numbers, and spaces
  const cleanedText = text.replace(/[^\w\s]|_/g, ' ');
  
  // Split into words and filter empty strings
  const words = cleanedText
    .split(/\s+/)
    .filter(word => word.length > 0)
    .filter(word => /[a-zA-Z]/.test(word)); // Must contain at least one letter

  const errors = [];
  const misspelledWords = [];

  for (const word of words) {
    // Skip if word is in user's vocabulary (case-insensitive)
    if (vocabSet.has(word.toLowerCase())) {
      continue;
    }
    
    // Skip numbers
    if (/^\d+$/.test(word)) {
      continue;
    }
    
    const isCorrect = dict.check(word);
    
    if (!isCorrect) {
      const suggestions = dict.suggest(word).slice(0, 3);
      errors.push({
        word: word,
        suggestions: suggestions
      });
      misspelledWords.push(word);
    }
  }

  return {
    errorCount: errors.length,
    errors: errors,
    misspelledWords: misspelledWords
  };
};

module.exports = { checkSpelling };