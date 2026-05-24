const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, verificationEmailTemplate, resetPasswordTemplate } = require('../utils/email');

// @POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, verificationToken });

    // Try sending verification email — non-fatal if email not configured
    try {
      const url = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
      await sendEmail({ to: email, subject: 'Verify your PizzaHub account', html: verificationEmailTemplate(name, url) });
      res.status(201).json({ success: true, message: 'Registration successful! Check your email to verify.' });
    } catch (emailErr) {
      console.warn('Email sending failed (check EMAIL config):', emailErr.message);
      // Auto-verify if email is not configured so dev/test can still login
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      res.status(201).json({ success: true, message: 'Registration successful! You can now login.' });
    }
  } catch (err) { next(err); }
};

// @POST /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified! You can now login.' });
  } catch (err) { next(err); }
};

// @POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified)
      return res.status(401).json({ success: false, message: 'Please verify your email first' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address },
    });
  } catch (err) { next(err); }
};

// @POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: user.email, subject: 'PizzaHub Password Reset', html: resetPasswordTemplate(user.name, url) });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) { next(err); }
};

// @POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @PUT /api/auth/update-profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
