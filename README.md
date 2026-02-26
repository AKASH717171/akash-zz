# LUXE FASHION — Women's E-Commerce Platform

A full-featured, luxury women's e-commerce website with real-time live chat, admin panel, and complete shopping experience.

## 🛍️ Overview

**LUXE FASHION** is a complete e-commerce solution for women's fashion, bags, and shoes. Features include:
- 🛒 Full shopping cart & checkout
- 💬 Real-time live chat (Socket.io) with auto-reply & coupon giveaway
- 👑 Complete admin panel
- 🎟️ Coupon & discount system
- ⭐ Product reviews
- 💌 Newsletter subscription
- 📊 Sales reports & analytics

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS 3, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.io |
| Images | Multer + Cloudinary |
| Charts | Recharts |
| Email | Nodemailer |

## 🎨 Design System

- **Primary:** `#1A1A2E` (Dark Navy)
- **Secondary:** `#C4A35A` (Gold)
- **Accent:** `#E8D5B7` (Beige)
- **Fonts:** Playfair Display (headings), Poppins (body)

---

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/luxe-fashion.git
cd luxe-fashion
```

### 2. Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/luxe_fashion
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=LUXE FASHION <noreply@luxefashion.com>
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Seed the Database
```bash
cd server
node seed.js
```

This creates:
- Admin user
- Demo user
- 3 main categories + 15 sub-categories
- 14 demo products
- 3 coupons (LUXE80, WELCOME50, FLAT10)
- Default store settings & banner

### 5. Start the Application

**Development mode (run both simultaneously):**
```bash
# Terminal 1 — Start server
cd server
npm run dev

# Terminal 2 — Start client
cd client
npm start
```

**Production:**
```bash
cd client && npm run build
cd ../server && NODE_ENV=production npm start
```

---

## 🔐 Default Credentials

### Admin Panel
- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@luxefashion.com`
- **Password:** `Admin@123`

### Demo User
- **Email:** `jane@example.com`
- **Password:** `User@123`

### Demo Coupons
| Code | Discount | Min Order |
|------|----------|-----------|
| `LUXE80` | 80% off | ৳0 |
| `WELCOME50` | 50% off | ৳500 |
| `FLAT10` | ৳10 off | ৳200 |

---

## 📁 Project Structure
```
luxe-fashion/
├── client/                          # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── admin/               # Admin UI components
│       │   ├── cart/                # Cart sidebar, items
│       │   ├── chat/                # Live chat widget
│       │   ├── common/              # Button, Modal, Toast, etc.
│       │   ├── home/                # Hero, Featured, etc.
│       │   ├── layout/              # Header, Footer, Nav
│       │   └── products/            # ProductCard, Gallery, etc.
│       ├── context/                 # AuthContext, CartContext, ChatContext
│       ├── hooks/                   # useAuth, useCart, useChat, etc.
│       ├── pages/
│       │   ├── account/             # Dashboard, Orders, Profile, etc.
│       │   ├── admin/               # All admin panel pages
│       │   └── *.jsx                # Public pages
│       ├── routes/                  # PrivateRoute, AdminRoute
│       └── utils/                   # api.js, helpers, constants
│
└── server/                          # Node.js Backend
    ├── config/                      # DB, Cloudinary config
    ├── controllers/                 # Business logic
    ├── middleware/                  # Auth, error handler, upload
    ├── models/                      # Mongoose schemas
    ├── routes/                      # API route definitions
    ├── socket/                      # Socket.io chat handler
    ├── utils/                       # Token, order number generators
    ├── uploads/                     # Local upload storage
    ├── seed.js                      # Database seeder
    └── server.js                    # App entry point
```

---

## 🌐 API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | User registration |
| `POST /api/auth/login` | User login |
| `POST /api/auth/admin/login` | Admin login |
| `GET /api/products` | Get products (filter, search, paginate) |
| `GET /api/products/:slug` | Product detail |
| `GET /api/categories` | All categories |
| `POST /api/orders` | Create order |
| `GET /api/cart` | Get cart |
| `POST /api/cart` | Add to cart |
| `POST /api/coupons/validate` | Validate coupon |
| `GET /api/dashboard/stats` | Admin dashboard stats |

---

## 💬 Live Chat Flow

1. User opens chat widget → auto welcome message
2. Bot asks for name → then email
3. Email saved → coupon code `LUXE80` sent automatically
4. Admin can take over the conversation in real-time
5. All conversations saved in MongoDB

---

## ✅ Features Checklist

- [x] User registration & login (JWT)
- [x] Admin panel with separate login
- [x] Product listing with filters, search, pagination
- [x] Product detail with image gallery, size/color selection
- [x] Shopping cart (guest + logged-in sync)
- [x] Coupon code system (% and fixed)
- [x] Checkout & order placement
- [x] Order tracking & status history
- [x] Real-time live chat (Socket.io)
- [x] Auto-reply bot with coupon giveaway
- [x] Product reviews (approve/reject)
- [x] Newsletter subscription
- [x] Wishlist
- [x] Admin: Dashboard with charts
- [x] Admin: Product CRUD with image upload
- [x] Admin: Order management
- [x] Admin: Customer management
- [x] Admin: Coupon management
- [x] Admin: Banner & FAQ management
- [x] Admin: Sales reports (Recharts)
- [x] Admin: Newsletter management
- [x] Responsive design (mobile-first)
- [x] Toast notifications
- [x] Loading states & error handling

---

## 📦 Key npm Packages

### Server
`express` `mongoose` `bcryptjs` `jsonwebtoken` `socket.io` `multer` `cloudinary` `nodemailer` `express-rate-limit` `helmet` `cors`

### Client
`react` `react-router-dom` `axios` `socket.io-client` `tailwindcss` `recharts` `react-hot-toast` `react-icons` `swiper` `framer-motion`

---

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.

## 📄 License
MIT