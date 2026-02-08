const { Vocabulary } = require('../models');

exports.getVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findAll({
      where: { user_id: req.user.user_id },
      order: [['word', 'ASC']]
    });

    res.json(vocabulary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching vocabulary' });
  }
};

exports.getVocabWord = async (req, res) => {
  try {
    const word = await Vocabulary.findOne({
      where: { 
        vocab_id: req.params.id, 
        user_id: req.user.user_id 
      }
    });

    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(word);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching word' });
  }
};

exports.addVocabWord = async (req, res) => {
  try {
    const { word, definition, translation, category, usage, pronunciation } = req.body;

    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const newWord = await Vocabulary.create({
      user_id: req.user.user_id,
      word,
      definition: definition || null,
      translation: translation || null,
      category: category || null,
      usage: usage || null,
      pronunciation: pronunciation || null,
      times_used: 0
    });

    res.status(201).json(newWord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding word' });
  }
};

exports.updateVocabWord = async (req, res) => {
  try {
    const { word, definition, translation, category, usage, pronunciation } = req.body;

    const vocabWord = await Vocabulary.findOne({
      where: { 
        vocab_id: req.params.id, 
        user_id: req.user.user_id 
      }
    });

    if (!vocabWord) {
      return res.status(404).json({ error: 'Word not found' });
    }

    if (word) vocabWord.word = word;
    if (definition !== undefined) vocabWord.definition = definition;
    if (translation !== undefined) vocabWord.translation = translation;
    if (category !== undefined) vocabWord.category = category;
    if (usage !== undefined) vocabWord.usage = usage;
    if (pronunciation !== undefined) vocabWord.pronunciation = pronunciation;

    await vocabWord.save();

    res.json({
      message: 'Word updated successfully',
      word: vocabWord
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating word' });
  }
};

exports.deleteVocabWord = async (req, res) => {
  try {
    const word = await Vocabulary.findOne({
      where: { 
        vocab_id: req.params.id, 
        user_id: req.user.user_id 
      }
    });

    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    await word.destroy();

    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting word' });
  }
};