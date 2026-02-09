const { checkSpelling } = require('../utils/spellChecker');
const { Text, TextType, Vocabulary } = require('../models');

exports.getTexts = async (req, res) => {
  try {
    const texts = await Text.findAll({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: TextType,
          as: 'textType',
          attributes: ['type_id', 'type_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(texts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching texts' });
  }
};

exports.getText = async (req, res) => {
  try {
    const text = await Text.findOne({
      where: { 
        text_id: req.params.id, 
        user_id: req.user.user_id 
      },
      include: [
        {
          model: TextType,
          as: 'textType',
          attributes: ['type_id', 'type_name']
        }
      ]
    });

    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    res.json(text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching text' });
  }
};

exports.createText = async (req, res) => {
  try {
    const { title, content, text_type_id } = req.body;

    if (!title || !content || !text_type_id) {
      return res.status(400).json({ error: 'Title, content, and text_type_id are required' });
    }

    const word_count = content.trim().split(/\s+/).length;

    // Fetch user's vocabulary
    const userVocab = await Vocabulary.findAll({
      where: { user_id: req.user.user_id },
      attributes: ['word']
    });
    
    const vocabWords = userVocab.map(v => v.word);

    // Check spelling (synchronous, excluding user vocabulary)
    const spellCheckResult = checkSpelling(content, vocabWords);

    const text = await Text.create({
      user_id: req.user.user_id,
      title,
      content,
      text_type_id,
      word_count,
      spelling_errors: spellCheckResult.errorCount,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({
      text,
      spell_check: {
        error_count: spellCheckResult.errorCount,
        errors: spellCheckResult.errors
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating text' });
  }
};

exports.updateText = async (req, res) => {
  try {
    const { title, content, text_type_id } = req.body;

    const text = await Text.findOne({
      where: { 
        text_id: req.params.id, 
        user_id: req.user.user_id 
      }
    });

    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    if (title) text.title = title;
    
    let spellCheckResult = null;
    
    if (content) {
      text.content = content;
      text.word_count = content.trim().split(/\s+/).length;
      
      // Fetch user's vocabulary
      const userVocab = await Vocabulary.findAll({
        where: { user_id: req.user.user_id },
        attributes: ['word']
      });
      
      const vocabWords = userVocab.map(v => v.word);
      
      // Check spelling (synchronous, excluding user vocabulary)
      spellCheckResult = checkSpelling(content, vocabWords);
      text.spelling_errors = spellCheckResult.errorCount;
    }
    
    if (text_type_id) text.text_type_id = text_type_id;

    text.updated_at = new Date();

    await text.save();

    res.json({
      message: 'Text updated successfully',
      text,
      spell_check: spellCheckResult ? {
        error_count: spellCheckResult.errorCount,
        errors: spellCheckResult.errors
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating text' });
  }
};

exports.deleteText = async (req, res) => {
  try {
    const text = await Text.findOne({
      where: { 
        text_id: req.params.id, 
        user_id: req.user.user_id 
      }
    });

    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    await text.destroy();

    res.json({ message: 'Text deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting text' });
  }
};