const Typo = require("typo-js");
const fs = require("fs");
const path = require("path");

let dictionary = null;

const initializeDictionary = () => {
  if (!dictionary) {
    const affPath = path.join(__dirname, "../dictionaries/en_US.aff");
    const dicPath = path.join(__dirname, "../dictionaries/en_US.dic");

    const affData = fs.readFileSync(affPath, "utf-8");
    const dicData = fs.readFileSync(dicPath, "utf-8");

    dictionary = new Typo("en_US", affData, dicData);
  }
  return dictionary;
};

const checkSpelling = (text, userVocabulary = []) => {
  const dict = initializeDictionary();

  // Normalize user vocabulary to lowercase for case-insensitive comparison
  const vocabSet = new Set(
    userVocabulary.map((word) => word.toLowerCase().trim()),
  );

  // Normalize fancy apostrophes to regular ones
  let normalizedText = text.replace(/'/g, "'");

  // Remove multi-word vocabulary phrases from text before checking individual words
  let textToCheck = normalizedText;
  const multiWordVocab = userVocabulary.filter(
    (v) => v.includes(" ") || v.includes("-"),
  );
  multiWordVocab.forEach((phrase) => {
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(?:^|[\\s])${escapedPhrase}(?=[\\s]|[.,!?;:]|$)`,
      "gi",
    );
    textToCheck = textToCheck.replace(regex, " "); // Replace phrase with space
  });

  // Remove punctuation but keep:
  // - letters (a-z, A-Z)
  // - apostrophes (')
  // - hyphens (-)
  // - accented characters (Latin Unicode: À-ÿ, Ā-ſ, etc.)
  const cleanedText = textToCheck.replace(
    /[^a-zA-Z'\-\u00C0-\u00FF\u0100-\u017F\s]/g,
    " ",
  );

  // Split into words (by spaces only, keep hyphens within words)
  const words = cleanedText
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .filter((word) => /[a-zA-Z\u00C0-\u00FF\u0100-\u017F]/.test(word))
    .filter((word) => {
      // Skip hyphenated words completely (they're compound words, not individual words)
      if (word.includes("-")) {
        return false;
      }
      return true;
    });

  const errors = [];
  const misspelledWords = [];

  for (const word of words) {
    const cleanWord = word.toLowerCase().trim();

    // Skip if word is in user's vocabulary (case-insensitive)
    if (vocabSet.has(cleanWord)) {
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
        suggestions: suggestions,
      });
      misspelledWords.push(word);
    }
  }

  return {
    errorCount: errors.length,
    errors: errors,
    misspelledWords: misspelledWords,
  };
};

module.exports = { checkSpelling };
