const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth');
const { TextType } = require('../models');

const {
  getTexts,
  getText,
  createText,
  updateText,
  deleteText
} = require('../controllers/text.controller');

router.use(authToken);

router.get('/types', async (req, res) => {
  try {
    const types = await TextType.findAll({
      attributes: ['type_id', 'type_name'],
      order: [['type_id', 'ASC']],
    });
    res.json(types);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching text types' });
  }
});

router.get('/', getTexts);
router.get('/:id', getText);
router.post('/', createText);
router.put('/:id', updateText);
router.delete('/:id', deleteText);

module.exports = router;