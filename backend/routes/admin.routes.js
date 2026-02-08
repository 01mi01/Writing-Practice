const express = require('express');
const router = express.Router();
const authToken = require('../middleware/auth');

const {
  getAdminDashboard,
  getAllUsers,
  getUserMetrics
} = require('../controllers/admin.controller');

router.use(authToken);

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.get('/users/:userId/metrics', getUserMetrics);

module.exports = router;