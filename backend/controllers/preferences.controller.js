const { UserPreference, Theme, Color, User } = require('../models');

exports.getPreferences = async (req, res) => {
  try {
    const preferences = await UserPreference.findOne({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: Theme,
          as: 'theme',
          attributes: ['theme_id', 'theme_name']
        },
        {
          model: Color,
          as: 'color',
          attributes: ['color_id', 'color_name']
        }
      ]
    });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json(preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching preferences' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    
    if (user.is_admin) {
      return res.status(403).json({ error: 'Admin users cannot change preferences' });
    }

    const { theme_id, color_id } = req.body;

    const preferences = await UserPreference.findOne({
      where: { user_id: req.user.user_id }
    });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    if (theme_id) preferences.theme_id = theme_id;
    if (color_id) preferences.color_id = color_id;

    await preferences.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating preferences' });
  }
};

exports.getThemes = async (req, res) => {
  try {
    const themes = await Theme.findAll();
    res.json(themes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching themes' });
  }
};

exports.getColors = async (req, res) => {
  try {
    const colors = await Color.findAll();
    res.json(colors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching colors' });
  }
};