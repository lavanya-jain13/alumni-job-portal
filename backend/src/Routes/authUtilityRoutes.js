const express = require('express');
const router = express.Router();
const authUtil = require('../controllers/AuthUtilityController');
const authenticate = require('../middleware/authMiddleware');

// public
router.post('/forgot-password', authUtil.forgotPassword);
router.post('/reset-password', authUtil.resetPassword);

// protected
router.post('/change-password', authenticate, authUtil.changePassword);

module.exports = router;