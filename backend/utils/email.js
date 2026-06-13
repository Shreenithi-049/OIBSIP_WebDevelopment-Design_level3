const nodemailer = require('nodemailer');

// ===============================
// Brevo SMTP Transport
// ===============================
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',

  // IMPORTANT:
  // Render free tier works better with 2525
  port: 2525,

  secure: false,

 auth: {
  user: 'ac6d96001@smtp-brevo.com',
  pass: process.env.BREVO_PASS,
},

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

// ===============================
// Debug Logs
// ===============================
console.log('BREVO_USER:', process.env.BREVO_USER);

console.log(
  'BREVO_PASS exists:',
  process.env.BREVO_PASS ? 'YES' : 'NO'
);

// ===============================
// Verify SMTP Connection
// ===============================
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP ERROR:', err);
  } else {
    console.log('SMTP READY ✅');
  }
});

// ===============================
// Generic Send Email Function
// ===============================
exports.sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const info = await transporter.sendMail({
      from: `"PizzaHub 🍕" <${process.env.BREVO_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);

    return info;
  } catch (error) {
    console.error('Email sending failed:', error);

    throw error;
  }
};

// ===============================
// OTP Email Template
// ===============================
exports.otpEmailTemplate = (name, otp) => `
<div style="font-family:Arial,sans-serif;background:#FAF3E0;padding:40px;max-width:600px;margin:auto;border-radius:14px;">
  <h1 style="color:#2A9D8F;text-align:center;">Welcome to PizzaHub 🍕</h1>
  <p style="color:#264653;font-size:16px;line-height:1.6;">Hi <b>${name}</b>,</p>
  <p style="color:#264653;font-size:16px;line-height:1.6;">Your email verification OTP is:</p>
  <div style="text-align:center;margin:30px 0;">
    <span style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#E63946;background:#fff3f3;padding:16px 32px;border-radius:12px;border:2px dashed #E63946;display:inline-block;">${otp}</span>
  </div>
  <p style="color:#666;font-size:14px;text-align:center;">This OTP expires in <b>10 minutes</b>. Do not share it with anyone.</p>
  <p style="color:#999;font-size:12px;margin-top:30px;">If you didn’t create this account, you can safely ignore this email.</p>
</div>
`;

// ===============================
// Reset Password Template
// ===============================
exports.resetPasswordTemplate = (
  name,
  resetUrl
) => `
<div style="
  font-family: Arial, sans-serif;
  background: #FAF3E0;
  padding: 40px;
  max-width: 600px;
  margin: auto;
  border-radius: 14px;
">

  <h1 style="
    color: #E63946;
    text-align: center;
  ">
    Reset Your Password 🔒
  </h1>

  <p style="
    color: #264653;
    font-size: 16px;
    line-height: 1.6;
  ">
    Hi <b>${name}</b>,
  </p>

  <p style="
    color: #264653;
    font-size: 16px;
    line-height: 1.6;
  ">
    We received a request to reset your password.
  </p>

  <div style="text-align:center;margin:35px 0;">
    <a
      href="${resetUrl}"
      style="
        background:#2A9D8F;
        color:white;
        padding:14px 28px;
        text-decoration:none;
        border-radius:8px;
        font-size:16px;
        font-weight:bold;
        display:inline-block;
      "
    >
      Reset Password
    </a>
  </div>

  <p style="
    color:#666;
    font-size:14px;
  ">
    This reset link will expire in 1 hour.
  </p>

</div>
`;

// ===============================
// Low Stock Alert Template
// ===============================
exports.lowStockTemplate = (items) => `
<div style="
  font-family: Arial, sans-serif;
  background: #FAF3E0;
  padding: 40px;
  max-width: 600px;
  margin: auto;
  border-radius: 14px;
">

  <h1 style="
    color:#E63946;
    text-align:center;
  ">
    ⚠️ Low Stock Alert
  </h1>

  <p style="
    color:#264653;
    font-size:16px;
  ">
    The following inventory items are running low:
  </p>

  <ul style="
    color:#264653;
    font-size:15px;
    line-height:1.8;
  ">
    ${items
      .map(
        (item) => `
      <li>
        <b>${item.name}</b> —
        ${item.quantity} ${item.unit} remaining
      </li>
    `
      )
      .join('')}
  </ul>

  <p style="
    color:#888;
    font-size:13px;
    margin-top:30px;
  ">
    Please restock inventory soon.
  </p>

</div>
`;