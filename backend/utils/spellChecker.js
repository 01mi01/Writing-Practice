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

  const normalizeStr = (s) => s.toLowerCase().trim().normalize("NFC");

  const vocabSet = new Set(userVocabulary.map((word) => normalizeStr(word)));

  let normalizedText = text.replace(/'/g, "'").normalize("NFC");

  let textToCheck = normalizedText;

  const multiWordVocab = userVocabulary.filter(
    (v) => v.includes(" ") || v.includes("-"),
  );

  multiWordVocab.forEach((phrase) => {
    const normalizedPhrase = phrase.normalize("NFC");
    const escapedPhrase = normalizedPhrase
      .toLowerCase()
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[\\s])${escapedPhrase}(?=[\\s]|[.,!?;:]|$)`, "gi");
    textToCheck = textToCheck.replace(regex, (match) => " ".repeat(match.length));
  });

  const cleanedText = textToCheck.replace(
    /[^a-zA-Z'\-\u00C0-\u00FF\u0100-\u017F\s]/g,
    " ",
  );

  const words = cleanedText
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .filter((word) => /[a-zA-Z\u00C0-\u00FF\u0100-\u017F]/.test(word))
    .filter((word) => !word.includes("-"));

  const errors = [];
  const misspelledWords = [];

  for (const word of words) {
    const cleanWord = normalizeStr(word);

    if (vocabSet.has(cleanWord)) continue;

    if (/^\d+$/.test(word)) continue;

    const isCorrect = dict.check(word);

    if (!isCorrect) {
      const suggestions = dict.suggest(word).slice(0, 3);
      errors.push({ word: word, suggestions: suggestions });
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