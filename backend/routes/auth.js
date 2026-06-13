const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification, forgotPassword, resetPassword, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// DEBUG route — remove after confirming deployment
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth router reachable ✅', timestamp: new Date().toISOString() });
});

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
