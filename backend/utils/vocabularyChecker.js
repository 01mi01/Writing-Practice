const countVocabularyUsage = (text, userVocabulary = []) => {
  if (!userVocabulary || userVocabulary.length === 0) {
    return {
      vocabWordsUsed: 0,
      wordsFound: []
    };
  }

  // Normalize text for case-insensitive matching
  // Keep hyphens and apostrophes for compound words and contractions
  const normalizedText = text.toLowerCase().replace(/'/g, "'");
  
  const wordsFound = [];
  let totalUsageCount = 0;

  userVocabulary.forEach(vocabWord => {
    const word = vocabWord.toLowerCase().trim();
    
    // Escape special regex characters in the vocab word
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match word boundaries - before: space, start of text, or punctuation
    // after: space, end of text, or punctuation
    const regex = new RegExp(`(?:^|\\s|[.,!?;:])${escapedWord}(?=\\s|[.,!?;:]|$)`, 'gi');
    
    // Find all matches
    const matches = [];
    let match;
    while ((match = regex.exec(normalizedText)) !== null) {
      matches.push(match);
    }
    
    if (matches.length > 0) {
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