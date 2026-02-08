const { User, Text, Vocabulary, EnglishLevel, Certification, TextType } = require('../models');
const { Op } = require('sequelize');

exports.getAdminDashboard = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const totalUsers = await User.count();
    
    const totalTexts = await Text.count();
    
    const totalVocabWords = await Vocabulary.count();
    
    const avgTextsPerUser = totalUsers > 0 ? (totalTexts / totalUsers).toFixed(2) : 0;
    
    const avgVocabPerUser = totalUsers > 0 ? (totalVocabWords / totalUsers).toFixed(2) : 0;
    
    const avgWordCount = await Text.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('word_count')), 'avg_word_count']]
    });
    
    const usersByLevel = await User.findAll({
      attributes: [
        'english_level_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('user_id')), 'count']
      ],
      include: [
        {
          model: EnglishLevel,
          as: 'englishLevel',
          attributes: ['level_name']
        }
      ],
      group: ['User.english_level_id', 'englishLevel.level_id', 'englishLevel.level_name']
    });
    
    const textsByType = await Text.findAll({
      attributes: [
        'text_type_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('text_id')), 'count']
      ],
      include: [
        {
          model: TextType,
          as: 'textType',
          attributes: ['type_name']
        }
      ],
      group: ['Text.text_type_id', 'textType.type_id', 'textType.type_name']
    });

    const recentTexts = await Text.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      attributes: ['text_id', 'title', 'word_count', 'created_at'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username']
        }
      ]
    });

    res.json({
      message: 'Admin Dashboard',
      statistics: {
        total_users: totalUsers,
        total_texts: totalTexts,
        total_vocab_words: totalVocabWords,
        avg_texts_per_user: parseFloat(avgTextsPerUser),
        avg_vocab_per_user: parseFloat(avgVocabPerUser),
        avg_word_count: avgWordCount ? parseFloat(avgWordCount.dataValues.avg_word_count).toFixed(2) : 0
      },
      users_by_level: usersByLevel,
      texts_by_type: textsByType,
      recent_texts: recentTexts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching admin dashboard' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const users = await User.findAll({
      attributes: ['user_id', 'username', 'email', 'birth_date', 'created_at', 'is_admin', 'current_streak', 'longest_streak'],
      include: [
        {
          model: EnglishLevel,
          as: 'englishLevel',
          attributes: ['level_name']
        },
        {
          model: Certification,
          as: 'certification',
          attributes: ['certification_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.getUserMetrics = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const userId = req.params.userId;

    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'username', 'email'],
      include: [
        {
          model: EnglishLevel,
          as: 'englishLevel',
          attributes: ['level_name']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const textCount = await Text.count({ where: { user_id: userId } });
    
    const vocabCount = await Vocabulary.count({ where: { user_id: userId } });
    
    const avgWordCount = await Text.findOne({
      where: { user_id: userId },
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('word_count')), 'avg_word_count']]
    });

    const texts = await Text.findAll({
      where: { user_id: userId },
      attributes: ['text_id', 'title', 'word_count', 'spelling_errors', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      user,
      metrics: {
        total_texts: textCount,
        total_vocab_words: vocabCount,
        avg_word_count: avgWordCount ? parseFloat(avgWordCount.dataValues.avg_word_count).toFixed(2) : 0
      },
      texts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user metrics' });
  }
};