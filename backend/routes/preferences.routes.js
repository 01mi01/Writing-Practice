const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth');

const {
  getPreferences,
  updatePreferences,
  getThemes,
  getColors
} = require('../controllers/preferences.controller');

router.use(authToken);

router.get('/', getPreferences);
router.put('/', updatePreferences);
router.get('/themes', getThemes);
router.get('/colors', getColors);

module.exports = router;