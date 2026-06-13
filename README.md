# 🍕 PizzaHub - Full Stack Pizza Delivery App

A production-ready MERN stack pizza delivery application with OTP-based email verification, real-time order tracking, Razorpay payments, and an admin dashboard.

**Live Demo**
- Frontend: https://oibsip-webdevelopment-design-level3-2.onrender.com
- Backend API: https://oibsip-webdevelopment-design-level3-1.onrender.com

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB Atlas |
| Auth | JWT + Bcrypt |
| Payments | Razorpay Test Mode |
| Email | Brevo SMTP (Nodemailer) |
| Real-time | Socket.IO |

---

## 🎯 Features

- ✅ User Registration with OTP Email Verification (10-minute expiry)
- ✅ Resend OTP with 60-second cooldown
- ✅ Login blocked until email is verified
- ✅ Forgot / Reset Password via Email
- ✅ Custom Pizza Builder (5-step wizard)
- ✅ Shopping Cart with quantity management
- ✅ Razorpay Payment Integration (Test Mode)
- ✅ Real-time Order Tracking with Socket.IO
- ✅ Admin Dashboard with Analytics
- ✅ Inventory Management with Low Stock Alerts
- ✅ Automated Email Notifications (cron jobs)
- ✅ Role-based Access Control (User / Admin)
- ✅ Fully Responsive Mobile-first Design
- ✅ Smart Navbar (hides Login/Register button on their own pages)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Brevo account (for SMTP emails)
- Razorpay Test account

### 1. Clone & Setup

```bash
git clone <your-repo>
cd pizza-delivery-app
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your .env values (see Environment Variables section)
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
```

### 4. Seed Database

```bash
cd backend
node seed.js
```

---

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pizzadb

JWT_SECRET=your_very_long_secret_key
JWT_EXPIRE=7d

BREVO_USER=your-brevo-smtp-login@smtp-brevo.com
BREVO_PASS=your_brevo_smtp_password

ADMIN_EMAIL=admin@yourdomain.com

RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
```

---

## 📧 Brevo SMTP Setup

1. Sign up at [brevo.com](https://brevo.com)
2. Go to **Transactional** → **SMTP & API**
3. Copy your SMTP login and generate a password
4. Use those as `BREVO_USER` and `BREVO_PASS`
5. SMTP host: `smtp-relay.brevo.com`, port: `2525`

---

## 🔐 OTP Verification Flow

1. User registers → 6-digit OTP sent to email (valid for 10 minutes)
2. User is redirected to `/verify-otp` page
3. User enters OTP → account verified → redirected to login
4. Login is blocked until OTP is verified
5. If OTP expires → use "Resend OTP" button (60-second cooldown)
6. If user tries to log in without verifying → shown a direct link to the OTP page

---

## 💳 Razorpay Test Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Dashboard → Settings → API Keys**
3. Generate Test Mode keys
4. Use test card: `4111 1111 1111 1111` / Any future date / Any CVV

---

## 🚀 Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set root directory to `backend`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add all environment variables in the Render **Environment** tab:

```
MONGO_URI, JWT_SECRET, JWT_EXPIRE
BREVO_USER, BREVO_PASS, ADMIN_EMAIL
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
CLIENT_URL  → your frontend URL (e.g. https://your-app.onrender.com)
BACKEND_URL → your backend URL (e.g. https://your-api.onrender.com)
NODE_ENV    → production
```

### Frontend → Render / Vercel

1. Push code to GitHub
2. Create a new **Static Site** (Render) or import on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables:

```
VITE_API_URL         → https://your-api.onrender.com/api
VITE_SOCKET_URL      → https://your-api.onrender.com
VITE_RAZORPAY_KEY_ID → rzp_test_xxxx
```

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user with read/write access
3. Network Access → Add IP: `0.0.0.0/0` (allow all for deployment)
4. Get the connection string and set it as `MONGO_URI`

> **Note:** Render free tier spins down after 15 minutes of inactivity. The first request after spin-down takes 30–60 seconds — this is expected behaviour, not a bug.

---

## 📁 Project Structure

```
pizza-delivery-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js       # register, verifyOTP, resendOTP, login, forgotPassword, resetPassword
│   │   ├── pizzaController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── inventoryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js                 # isVerified, emailOTP, emailOTPExpire
│   │   ├── Pizza.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Inventory.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js                 # /register, /verify-otp, /resend-otp, /login, /forgot-password, /reset-password
│   │   ├── pizza.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── payment.js
│   │   └── inventory.js
│   ├── socket/
│   │   └── socket.js
│   ├── utils/
│   │   ├── email.js                # otpEmailTemplate, resetPasswordTemplate, lowStockTemplate
│   │   ├── generateToken.js
│   │   └── cronJobs.js
│   ├── seed.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── PizzaCard.jsx
    │   │   │   ├── OrderTracker.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── layout/
    │   │       ├── Navbar.jsx
    │   │       └── Footer.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── VerifyOtpPage.jsx   # 6-digit OTP input, countdown timer, resend
    │   │   ├── AuthPages.jsx       # ForgotPasswordPage, ResetPasswordPage
    │   │   ├── CartPage.jsx
    │   │   ├── CustomPizzaPage.jsx
    │   │   ├── OrderPages.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── PizzaDetailPage.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminOrders.jsx
    │   │       └── AdminInventory.jsx
    │   ├── store/
    │   │   ├── slices/
    │   │   │   ├── authSlice.js
    │   │   │   └── cartSlice.js
    │   │   └── store.js
    │   ├── services/
    │   │   ├── api.js
    │   │   └── socket.js
    │   └── App.jsx
    └── index.html
```

---

## 📱 Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home / Menu |
| `/pizza/:id` | Public | Pizza Detail |
| `/login` | Guest only | Login |
| `/register` | Guest only | Register |
| `/verify-otp` | Public | OTP Verification |
| `/forgot-password` | Guest only | Forgot Password |
| `/reset-password/:token` | Public | Reset Password |
| `/custom-pizza` | User | Pizza Builder |
| `/cart` | User | Shopping Cart + Checkout |
| `/orders` | User | Order History |
| `/order-confirmation/:id` | User | Live Order Tracking |
| `/profile` | User | User Profile |
| `/admin` | Admin | Admin Dashboard |
| `/admin/orders` | Admin | Order Management |
| `/admin/inventory` | Admin | Inventory Management |

---

## 🎨 Color Palette

```css
--primary:    #2A9D8F  /* Teal */
--secondary:  #E63946  /* Red */
--background: #FAF3E0  /* Cream */
--text:       #264653  /* Dark */
--accent:     #F4C95D  /* Yellow */
--hover:      #F77F00  /* Orange */
--card:       #FFF8E7  /* Light cream */
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register + send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP (60s cooldown) |
| POST | `/api/auth/login` | Login (verified users only) |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET  | `/api/auth/me` | Get current user |
| PUT  | `/api/auth/update-profile` | Update profile |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/cart` | Get cart |
| POST   | `/api/cart/add` | Add item |
| PUT    | `/api/cart/update/:itemId` | Update quantity |
| DELETE | `/api/cart/remove/:itemId` | Remove item |
| DELETE | `/api/cart/clear` | Clear cart |

---

Built with ❤️ using MERN Stack
