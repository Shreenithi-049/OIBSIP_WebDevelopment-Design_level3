const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, otpEmailTemplate, resetPasswordTemplate } = require('../utils/email');

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ======================================================
// @POST /api/auth/register
// ======================================================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    // If user exists and is already verified, reject
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser) {
      // Unverified user re-registering — refresh OTP
      existingUser.name = name;
      existingUser.password = password;
      existingUser.emailOTP = otp;
      existingUser.emailOTPExpire = otpExpire;
      await existingUser.save();
    } else {
      await User.create({ name, email, password, isVerified: false, emailOTP: otp, emailOTPExpire: otpExpire });
    }

    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your PizzaHub Account 🍕',
        html: otpEmailTemplate(name, otp),
      });
    } catch (emailError) {
      console.error('OTP email failed:', emailError);
      // Don't delete the user — let them use resend
      return res.status(500).json({ success: false, message: 'Could not send OTP email. Try resending.' });
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify within 10 minutes.',
      email,
    });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @POST /api/auth/verify-otp
// ======================================================
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' });
    }

    if (!user.emailOTP || user.emailOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (user.emailOTPExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @POST /api/auth/resend-otp
// ======================================================
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified.' });
    }

    // 60-second cooldown: block if last OTP was sent less than 60s ago
    const cooldown = 60 * 1000;
    if (user.emailOTPExpire && (user.emailOTPExpire - 10 * 60 * 1000 + cooldown) > Date.now()) {
      const secondsLeft = Math.ceil(
        ((user.emailOTPExpire - 10 * 60 * 1000 + cooldown) - Date.now()) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${secondsLeft} seconds before requesting a new OTP.`,
        retryAfter: secondsLeft,
      });
    }

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Your New PizzaHub OTP 🍕',
      html: otpEmailTemplate(user.name, otp),
    });

    res.json({ success: true, message: 'New OTP sent to your email.' });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @POST /api/auth/login
// ======================================================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        notVerified: true,
        email: user.email,
        message: 'Please verify your email using the OTP sent to your inbox.',
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @POST /api/auth/forgot-password
// ======================================================
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'PizzaHub Password Reset 🔒',
      html: resetPasswordTemplate(user.name, resetUrl),
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @POST /api/auth/reset-password/:token
// ======================================================
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @GET /api/auth/me
// ======================================================
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ======================================================
// @PUT /api/auth/update-profile
// ======================================================
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
