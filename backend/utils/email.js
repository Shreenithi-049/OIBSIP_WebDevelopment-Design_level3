const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',

  // Use 2525 instead of 587 to avoid Render SMTP timeout
  port: 2525,

  secure: false,

  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Debug Logs
console.log('BREVO_USER:', process.env.BREVO_USER);
console.log(
  'BREVO_PASS length:',
  process.env.BREVO_PASS
    ? process.env.BREVO_PASS.length
    : 'NOT SET'
);

// Verify SMTP Connection
transporter.verify((err) => {
  if (err) {
    console.error(
      'SMTP connection failed:',
      err.message,
      err.code
    );
  } else {
    console.log('SMTP ready to send emails ✅');
  }
});

// Send Email Function
exports.sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"PizzaHub 🍕" <${process.env.BREVO_USER}>`,
    to,
    subject,
    html,
  });
};

// Verification Email Template
exports.verificationEmailTemplate = (name, url) => `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    background: #FAF3E0;
    padding: 30px;
    border-radius: 12px;
  ">
    <h2 style="color:#2A9D8F">
      Welcome to PizzaHub, ${name}! 🍕
    </h2>

    <p style="color:#264653">
      Please verify your email to start ordering delicious pizzas.
    </p>

    <a
      href="${url}"
      style="
        background:#E63946;
        color:white;
        padding:12px 24px;
        border-radius:8px;
        text-decoration:none;
        display:inline-block;
        margin:16px 0;
      "
    >
      Verify Email
    </a>

    <p style="color:#888;font-size:12px">
      Link expires in 24 hours.
    </p>
  </div>
`;

// Reset Password Template
exports.resetPasswordTemplate = (name, url) => `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    background: #FAF3E0;
    padding: 30px;
    border-radius: 12px;
  ">
    <h2 style="color:#2A9D8F">
      Password Reset Request
    </h2>

    <p style="color:#264653">
      Hi ${name}, click below to reset your password.
    </p>

    <a
      href="${url}"
      style="
        background:#E63946;
        color:white;
        padding:12px 24px;
        border-radius:8px;
        text-decoration:none;
        display:inline-block;
        margin:16px 0;
      "
    >
      Reset Password
    </a>

    <p style="color:#888;font-size:12px">
      Link expires in 1 hour. Ignore if not requested.
    </p>
  </div>
`;

// Low Stock Template
exports.lowStockTemplate = (items) => `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    background: #FAF3E0;
    padding: 30px;
    border-radius: 12px;
  ">
    <h2 style="color:#E63946">
      ⚠️ Low Stock Alert
    </h2>

    <p style="color:#264653">
      The following items are running low:
    </p>

    <ul>
      ${items
        .map(
          (i) => `
            <li style="color:#264653">
              <b>${i.name}</b> — ${i.quantity} ${i.unit} remaining
            </li>
          `
        )
        .join('')}
    </ul>

    <p style="color:#888;font-size:12px">
      Please restock soon to avoid order disruptions.
    </p>
  </div>
`;