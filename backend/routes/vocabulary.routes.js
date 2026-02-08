const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth');

const {
  getVocabulary,
  getVocabWord,
  addVocabWord,
  updateVocabWord,
  deleteVocabWord
} = require('../controllers/vocabulary.controller');

router.use(authToken);

router.get('/', getVocabulary);
router.get('/:id', getVocabWord);
router.post('/', addVocabWord);
router.put('/:id', updateVocabWord);
router.delete('/:id', deleteVocabWord);

module.exports = router;