const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth');

const {
  getTexts,
  getText,
  createText,
  updateText,
  deleteText
} = require('../controllers/text.controller');

router.use(authToken);

router.get('/', getTexts);
router.get('/:id', getText);
router.post('/', createText);
router.put('/:id', updateText);
router.delete('/:id', deleteText);

module.exports = router;