# 🍕 PizzaHub - Full Stack Pizza Delivery App

A production-ready MERN stack pizza delivery application with real-time order tracking, Razorpay payments, and admin dashboard.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite, Tailwind CSS, Redux Toolkit, Framer Motion |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB Atlas |
| Auth | JWT + Bcrypt |
| Payments | Razorpay Test Mode |
| Email | Nodemailer (Gmail) |
| Real-time | Socket.IO |

## 🎯 Features

- ✅ User Registration & Login with Email Verification
- ✅ Forgot/Reset Password via Email
- ✅ Custom Pizza Builder (5-step wizard)
- ✅ Shopping Cart with quantity management
- ✅ Razorpay Payment Integration (Test Mode)
- ✅ Real-time Order Tracking with Socket.IO
- ✅ Admin Dashboard with Analytics
- ✅ Inventory Management with Low Stock Alerts
- ✅ Automated Email Notifications (cron jobs)
- ✅ Role-based Access Control (User/Admin)
- ✅ Fully Responsive Mobile-first Design

## 🔑 Test Credentials

```
Admin: admin@pizzahub.com / Admin@123
User:  user@pizzahub.com  / User@123
```

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Gmail account (for emails)
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
# Fill in your .env values (see below)
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

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pizzadb
JWT_SECRET=your_very_long_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password        # Gmail App Password (not regular password)
ADMIN_EMAIL=admin@pizzahub.com
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
```

## 📧 Gmail App Password Setup

1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords → Generate
4. Use generated password as `EMAIL_PASS`

## 💳 Razorpay Test Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate Test Mode keys
4. Use test card: `4111 1111 1111 1111` / Any future date / Any CVV

## 🚀 Deployment

### Backend → Render

1. Push backend to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Connect GitHub repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables in Render dashboard
7. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Push frontend to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables:
   - `VITE_API_URL` = your Render backend URL + `/api`
   - `VITE_SOCKET_URL` = your Render backend URL
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay test key

### MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (allow all for deployment)
4. Get connection string and set as `MONGO_URI`

## 📁 Project Structure

```
pizza-delivery-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pizzaController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── inventoryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── User.js, Pizza.js, Cart.js
│   │   ├── Order.js, Payment.js
│   │   ├── Inventory.js, Notification.js
│   ├── routes/
│   ├── socket/socket.js
│   ├── utils/
│   │   ├── email.js, generateToken.js, cronJobs.js
│   ├── seed.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/ (PizzaCard, OrderTracker, Spinner, ProtectedRoute)
    │   │   └── layout/ (Navbar, Footer)
    │   ├── pages/
    │   │   ├── HomePage, LoginPage, RegisterPage
    │   │   ├── CartPage, CustomPizzaPage
    │   │   ├── OrderPages, ProfilePage, PizzaDetailPage
    │   │   └── admin/ (Dashboard, Orders, Inventory)
    │   ├── store/ (Redux slices)
    │   ├── services/ (api.js, socket.js)
    │   └── App.jsx
    └── index.html
```

## 🎨 Color Palette

```css
--primary: #2A9D8F    /* Teal */
--secondary: #E63946  /* Red */
--background: #FAF3E0 /* Cream */
--text: #264653       /* Dark */
--accent: #F4C95D     /* Yellow */
--hover: #F77F00      /* Orange */
--card: #FFF8E7       /* Light cream */
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home / Menu |
| `/pizza/:id` | Pizza Detail |
| `/custom-pizza` | Pizza Builder |
| `/cart` | Shopping Cart + Checkout |
| `/orders` | Order History |
| `/order-confirmation/:id` | Live Order Tracking |
| `/profile` | User Profile |
| `/admin` | Admin Dashboard |
| `/admin/orders` | Order Management |
| `/admin/inventory` | Inventory Management |

---

Built with ❤️ using MERN Stack
