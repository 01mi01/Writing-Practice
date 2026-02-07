const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth');

const {
  getDashboard
} = require('../controllers/dashboard.controller');

router.use(authToken);

router.get('/', getDashboard);

module.exports = router;