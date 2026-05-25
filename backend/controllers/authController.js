// backend/controllers/authController.js

const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordTemplate,
} = require('../utils/email');

// ======================================================
// @POST /api/auth/register
// ======================================================
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Generate verification token
    const verificationToken = crypto
      .randomBytes(32)
      .toString('hex');

    const verificationTokenExpire =
      Date.now() + 24 * 60 * 60 * 1000;

    // Create user
    const user = await User.create({
      name,
      email,
      password,

      isVerified: false,

      verificationToken,
      verificationTokenExpire,
    });

    // Verification URL
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        to: email,

        subject: 'Verify Your PizzaHub Account 🍕',

        html: verificationEmailTemplate(
          name,
          verifyUrl
        ),
      });
    } catch (emailError) {
      console.error(
        'Verification email failed:',
        emailError
      );

      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message:
          'Could not send verification email. Please try again.',
      });
    }

    // Success response
    res.status(201).json({
      success: true,

      message:
        'Registration successful! Please verify your email before logging in.',
    });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @GET /api/auth/verify-email/:token
// ======================================================
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({
      verificationToken: token,

      verificationTokenExpire: {
        $gt: Date.now(),
      },
    });

    // Invalid token
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/verify-email/failed`
      );
    }

    // Verify account
    user.isVerified = true;

    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    // Redirect success page
    res.redirect(
      `${process.env.CLIENT_URL}/verify-email/success`
    );
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

    // Invalid credentials
    if (
      !user ||
      !(await user.matchPassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Block login if not verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,

        notVerified: true,

        message:
          'Please verify your email before logging in',
      });
    }

    // Login success
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
exports.forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'No account found with this email',
      });
    }

    // Generate reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    // Hash token
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Expiry
    user.resetPasswordExpire =
      Date.now() + 60 * 60 * 1000;

    await user.save();

    // Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send reset mail
    await sendEmail({
      to: user.email,

      subject: 'PizzaHub Password Reset 🔒',

      html: resetPasswordTemplate(
        user.name,
        resetUrl
      ),
    });

    res.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @POST /api/auth/reset-password/:token
// ======================================================
exports.resetPassword = async (
  req,
  res,
  next
) => {
  try {
    // Hash incoming token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    // Invalid token
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Update password
    user.password = req.body.password;

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (err) {
    next(err);
  }
};

// ======================================================
// @GET /api/auth/me
// ======================================================
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// ======================================================
// @PUT /api/auth/update-profile
// ======================================================
exports.updateProfile = async (
  req,
  res,
  next
) => {
  try {
    const { name, phone, address } =
      req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        address,
      },
      {
        new: true,
      }
    ).select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};