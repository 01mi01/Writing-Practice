const { checkSpelling } = require("../utils/spellChecker");
const { countConnectors } = require("../utils/connectorChecker");
const { countVocabularyUsage } = require("../utils/vocabularyChecker");
const { Text, TextType, Vocabulary } = require("../models");

exports.getTexts = async (req, res) => {
  try {
    const texts = await Text.findAll({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: TextType,
          as: "textType",
          attributes: ["type_id", "type_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(texts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching texts" });
  }
};

exports.getText = async (req, res) => {
  try {
    const text = await Text.findOne({
      where: {
        text_id: req.params.id,
        user_id: req.user.user_id,
      },
      include: [
        {
          model: TextType,
          as: "textType",
          attributes: ["type_id", "type_name"],
        },
      ],
    });

    if (!text) {
      return res.status(404).json({ error: "Text not found" });
    }

    res.json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching text" });
  }
};

exports.createText = async (req, res) => {
  try {
    const { title, content, text_type_id } = req.body;

    if (!title || !content || !text_type_id) {
      return res
        .status(400)
        .json({ error: "Title, content, and text_type_id are required" });
    }

    const word_count = content.trim().split(/\s+/).length;

    // Count connectors
    const { basicCount, advancedCount } = countConnectors(content);

    // Fetch user's vocabulary
    const userVocab = await Vocabulary.findAll({
      where: { user_id: req.user.user_id },
      attributes: ["vocab_id", "word"],
    });

    const vocabWords = userVocab.map((v) => v.word);

    // Count vocabulary usage FIRST
    const vocabUsage = countVocabularyUsage(content, vocabWords);

    // Update times_used for each vocabulary word found
    for (const foundWord of vocabUsage.wordsFound) {
      await Vocabulary.increment(
        { times_used: foundWord.count },
        { where: { user_id: req.user.user_id, word: foundWord.word } },
      );
    }

    // Check spelling (excluding user vocabulary)
    const spellCheckResult = checkSpelling(content, vocabWords);

    const text = await Text.create({
      user_id: req.user.user_id,
      title,
      content,
      text_type_id,
      word_count,
      spelling_errors: spellCheckResult.errorCount,
      basic_connectors_count: basicCount,
      advanced_connectors_count: advancedCount,
      vocab_words_used: vocabUsage.vocabWordsUsed,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      text,
      spell_check: {
        error_count: spellCheckResult.errorCount,
        errors: spellCheckResult.errors,
      },
      vocabulary_usage: vocabUsage.wordsFound,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating text" });
  }
};

exports.updateText = async (req, res) => {
  try {
    const { title, content, text_type_id } = req.body;

    const text = await Text.findOne({
      where: {
        text_id: req.params.id,
        user_id: req.user.user_id,
      },
    });

    if (!text) {
      return res.status(404).json({ error: "Text not found" });
    }

    if (title) text.title = title;

    let spellCheckResult = null;

    if (content) {
      // Fetch user's vocabulary
      const userVocab = await Vocabulary.findAll({
        where: { user_id: req.user.user_id },
        attributes: ["vocab_id", "word"],
      });

      const vocabWords = userVocab.map((v) => v.word);

      // Count OLD vocabulary usage (before update)
      const oldVocabUsage = countVocabularyUsage(text.content, vocabWords);

      // Decrement times_used for old content
      for (const foundWord of oldVocabUsage.wordsFound) {
        await Vocabulary.decrement(
          { times_used: foundWord.count },
          { where: { user_id: req.user.user_id, word: foundWord.word } },
        );
      }

      // Update text content
      text.content = content;
      text.word_count = content.trim().split(/\s+/).length;

      // Count connectors
      const { basicCount, advancedCount } = countConnectors(content);
      text.basic_connectors_count = basicCount;
      text.advanced_connectors_count = advancedCount;

      // Count NEW vocabulary usage
      const newVocabUsage = countVocabularyUsage(content, vocabWords);
      text.vocab_words_used = newVocabUsage.vocabWordsUsed;

      // Increment times_used for new content
      for (const foundWord of newVocabUsage.wordsFound) {
        await Vocabulary.increment(
          { times_used: foundWord.count },
          { where: { user_id: req.user.user_id, word: foundWord.word } },
        );
      }

      // Check spelling (excluding user vocabulary)
      spellCheckResult = checkSpelling(content, vocabWords);
      text.spelling_errors = spellCheckResult.errorCount;
    }

    if (text_type_id) text.text_type_id = text_type_id;

    text.updated_at = new Date();

    await text.save();

    res.json({
      message: "Text updated successfully",
      text,
      spell_check: spellCheckResult
        ? {
            error_count: spellCheckResult.errorCount,
            errors: spellCheckResult.errors,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating text" });
  }
};

exports.deleteText = async (req, res) => {
  try {
    const text = await Text.findOne({
      where: {
        text_id: req.params.id,
        user_id: req.user.user_id,
      },
    });

    if (!text) {
      return res.status(404).json({ error: "Text not found" });
    }

    await text.destroy();

    res.json({ message: "Text deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting text" });
  }
};
