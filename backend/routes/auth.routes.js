const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser
} = require('../controllers/auth.controller');

const { EnglishLevel, Certification } = require('../models');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/english-levels', async (req, res) => {
  try {
    const levels = await EnglishLevel.findAll({
      attributes: ['level_id', 'level_name'],
      where: {
        level_name: {
          [require('sequelize').Op.ne]: 'No aplica'
        }
      },
      order: [['level_id', 'ASC']]
    });
    res.json(levels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching English levels' });
  }
});

router.get('/certifications', async (req, res) => {
  try {
    const certifications = await Certification.findAll({
      attributes: ['certification_id', 'certification_name'],
      order: [['certification_id', 'ASC']]
    });
    res.json(certifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching certifications' });
  }
});

router.post('/validate-step1', async (req, res) => {
  const { username, email } = req.body;

  try {
    const { User } = require('../models');

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Ya existe un usuario con este email" });
    }

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

module.exports = router;