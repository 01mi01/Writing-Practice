const { Text } = require('../models');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const totalTexts = await Text.count({
      where: { user_id: userId }
    });

    res.json({
      message: 'Dashboard works',
      user_id: userId,
      total_texts: totalTexts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dashboard' });
  }
};