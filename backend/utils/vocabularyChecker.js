const countVocabularyUsage = (text, userVocabulary = []) => {
  if (!userVocabulary || userVocabulary.length === 0) {
    return {
      vocabWordsUsed: 0,
      wordsFound: []
    };
  }

  // Normalize text for case-insensitive matching
  const normalizedText = text.toLowerCase().replace(/'/g, "'");
  
  const wordsFound = [];
  let totalUsageCount = 0;

  userVocabulary.forEach(vocabWord => {
    const word = vocabWord.toLowerCase();
    
    // Use word boundary regex for exact matching
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    
    if (matches && matches.length > 0) {
      wordsFound.push({
        word: vocabWord,
        count: matches.length
      });
      totalUsageCount += matches.length;
    }
  });

  return {
    vocabWordsUsed: totalUsageCount,
    wordsFound: wordsFound
  };
};

module.exports = { countVocabularyUsage };