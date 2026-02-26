// ============================================
// 🛍️ LUXE FASHION — Project Setup Script
// Run: node setup.js
// সব folders + files + starter code তৈরি হবে
// ============================================

const fs = require("fs");
const path = require("path");

console.log("\n🛍️  LUXE FASHION — Project Setup Starting...\n");

// ============================================
// 📁 সব Folders এবং Files এর তালিকা
// ============================================

const structure = {
  // ========================
  // 🖥️ SERVER (Backend)
  // ========================
  "server/config/db.js": `const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`❌ MongoDB Error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;
`,

  "server/config/cloudinary.js": `const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
`,

  // --- Models ---
  "server/models/User.js": `const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: "US" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin", "manager", "staff"], default: "user" },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        size: String,
        color: String,
      },
    ],
    profileImage: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
`,

  "server/models/Product.js": `const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: String, default: "" },
    images: [{ type: String }],
    mainImage: { type: Number, default: 0 },
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    sizes: [{ type: String, enum: ["XS", "S", "M", "L", "XL", "XXL", "Free"] }],
    colors: [
      {
        name: String,
        code: String,
      },
    ],
    stock: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    tags: [String],
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "draft", "archived"], default: "active" },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
`,

  "server/models/Category.js": `const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
`,

  "server/models/Order.js": `const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  title: String,
  image: String,
  quantity: { type: Number, required: true },
  size: String,
  color: String,
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    subtotal: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "inTransit", "delivered", "cancelled", "returnRequested", "returned"],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    notes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
`,

  "server/models/Coupon.js": `const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
`,

  "server/models/Review.js": `const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
`,

  "server/models/Chat.js": `const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["visitor", "admin", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true },
    visitorName: { type: String, default: "Visitor" },
    visitorEmail: { type: String, default: "" },
    messages: [messageSchema],
    status: { type: String, enum: ["active", "closed"], default: "active" },
    couponSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
`,

  "server/models/Newsletter.js": `const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  status: { type: String, enum: ["subscribed", "unsubscribed"], default: "subscribed" },
  subscribedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Newsletter", newsletterSchema);
`,

  "server/models/Settings.js": `const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "LUXE FASHION" },
    tagline: { type: String, default: "Elegance Redefined — Style That Speaks" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    contactEmail: { type: String, default: "support@luxefashion.com" },
    contactPhone: { type: String, default: "+1 (555) 123-4567" },
    address: { type: String, default: "123 Fashion Ave, New York, NY 10001" },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      pinterest: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    freeShippingThreshold: { type: Number, default: 50 },
    flatShippingRate: { type: Number, default: 5.99 },
    currency: { type: String, default: "$" },
    autoReply: {
      welcomeMessage: {
        type: String,
        default: "Hi! Welcome to LUXE FASHION! 👋\\n\\n🎉 Great news! You\\'re eligible for our EXCLUSIVE 80% OFF coupon!\\n\\nTo get your coupon code:\\n1️⃣ Tell us your name\\n2️⃣ Share your email address\\n3️⃣ We\\'ll send you your unique coupon code!\\n\\nReady? Type your name to get started! 🚀",
      },
      couponCode: { type: String, default: "LUXE80" },
      offlineMessage: { type: String, default: "We\\'re currently offline. Leave a message and we\\'ll get back to you!" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
`,

  "server/models/Banner.js": `const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    title: { type: String, default: "GRAND OPENING SALE" },
    subtitle: { type: String, default: "UP TO 80% OFF on Your First Order" },
    description: { type: String, default: "" },
    ctaText: { type: String, default: "Shop Now" },
    ctaLink: { type: String, default: "/shop" },
    ctaText2: { type: String, default: "Get Coupon" },
    ctaLink2: { type: String, default: "#chat" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
`,

  // --- Middleware ---
  "server/middleware/auth.js": `const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (req.user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, isAdmin };
`,

  "server/middleware/errorHandler.js": `const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = \`\${field} already exists\`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(\`Not Found - \${req.originalUrl}\`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
`,

  "server/middleware/upload.js": `const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "server/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, webp, gif) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
`,

  "server/middleware/validate.js": `const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    next();
  };
};

module.exports = validate;
`,

  // --- Utils ---
  "server/utils/generateToken.js": `const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
`,

  "server/utils/generateOrderNumber.js": `const generateOrderNumber = () => {
  const prefix = "LF";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return \`\${prefix}-\${timestamp}\${random}\`;
};

module.exports = generateOrderNumber;
`,

  "server/utils/helpers.js": `const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\\s+/g, "-")
    .replace(/[^\\w\\-]+/g, "")
    .replace(/\\-\\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

module.exports = { slugify };
`,

  // --- Controllers ---
  "server/controllers/authController.js": `// Auth Controller — register, login, getProfile, updateProfile, changePassword, adminLogin
// TODO: Implement in STEP 2
module.exports = {};
`,

  "server/controllers/productController.js": `// Product Controller — CRUD + filtering + pagination
// TODO: Implement in STEP 3
module.exports = {};
`,

  "server/controllers/categoryController.js": `// Category Controller — CRUD
// TODO: Implement in STEP 3
module.exports = {};
`,

  "server/controllers/orderController.js": `// Order Controller — create, getMyOrders, getOrderById, getAllOrders, updateStatus, dashboard stats
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/cartController.js": `// Cart Controller — getCart, addToCart, updateCartItem, removeFromCart, clearCart
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/wishlistController.js": `// Wishlist Controller — getWishlist, toggleWishlist
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/couponController.js": `// Coupon Controller — validate, CRUD
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/reviewController.js": `// Review Controller — getProductReviews, createReview, admin CRUD
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/chatController.js": `// Chat Controller — getAllChats, getChatById, deleteChat, autoReply settings
// TODO: Implement in STEP 5
module.exports = {};
`,

  "server/controllers/newsletterController.js": `// Newsletter Controller — subscribe, getAllSubscribers, delete
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/settingsController.js": `// Settings Controller — getSettings, updateSettings
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/bannerController.js": `// Banner Controller — CRUD
// TODO: Implement in STEP 4
module.exports = {};
`,

  "server/controllers/uploadController.js": `// Upload Controller — single, multiple, delete
// TODO: Implement in STEP 3
module.exports = {};
`,

  "server/controllers/dashboardController.js": `// Dashboard Controller — stats, sales graph, top products
// TODO: Implement in STEP 4
module.exports = {};
`,

  // --- Routes ---
  "server/routes/authRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 2
module.exports = router;
`,

  "server/routes/productRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 3
module.exports = router;
`,

  "server/routes/categoryRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 3
module.exports = router;
`,

  "server/routes/orderRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/cartRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/wishlistRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/couponRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/reviewRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/chatRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 5
module.exports = router;
`,

  "server/routes/newsletterRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/settingsRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/bannerRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  "server/routes/uploadRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 3
module.exports = router;
`,

  "server/routes/dashboardRoutes.js": `const express = require("express");
const router = express.Router();
// TODO: Add routes in STEP 4
module.exports = router;
`,

  // --- Socket ---
  "server/socket/chatSocket.js": `// Socket.io Chat Handler
// TODO: Implement in STEP 5
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
`,

  // --- Uploads folder ---
  "server/uploads/.gitkeep": "",

  // --- Seed file ---
  "server/seed.js": `const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");
const Settings = require("./models/Settings");
const Banner = require("./models/Banner");

const connectDB = require("./config/db");

const seedData = async () => {
  try {
    await connectDB();
    console.log("🗑️  Clearing old data...");

    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Settings.deleteMany();
    await Banner.deleteMany();

    // --- Admin User ---
    console.log("👤 Creating admin user...");
    const admin = await User.create({
      name: "Admin",
      email: "admin@luxefashion.com",
      password: "Admin@123",
      role: "admin",
    });

    // --- Categories ---
    console.log("📁 Creating categories...");
    const fashionCat = await Category.create({ name: "Women Fashion", slug: "women-fashion", description: "Discover the latest trends in women fashion", order: 1 });
    const bagsCat = await Category.create({ name: "Bags", slug: "bags", description: "Find your perfect bag", order: 2 });
    const shoesCat = await Category.create({ name: "Shoes", slug: "shoes", description: "Step into elegance", order: 3 });

    // Sub-categories
    await Category.insertMany([
      { name: "Dresses", slug: "dresses", parent: fashionCat._id, order: 1 },
      { name: "Tops & Blouses", slug: "tops-blouses", parent: fashionCat._id, order: 2 },
      { name: "Pants & Jeans", slug: "pants-jeans", parent: fashionCat._id, order: 3 },
      { name: "Traditional Wear", slug: "traditional-wear", parent: fashionCat._id, order: 4 },
      { name: "Jackets & Coats", slug: "jackets-coats", parent: fashionCat._id, order: 5 },
      { name: "Handbags", slug: "handbags", parent: bagsCat._id, order: 1 },
      { name: "Tote Bags", slug: "tote-bags", parent: bagsCat._id, order: 2 },
      { name: "Clutch & Evening", slug: "clutch-evening", parent: bagsCat._id, order: 3 },
      { name: "Backpacks", slug: "backpacks", parent: bagsCat._id, order: 4 },
      { name: "Crossbody Bags", slug: "crossbody-bags", parent: bagsCat._id, order: 5 },
      { name: "Heels", slug: "heels", parent: shoesCat._id, order: 1 },
      { name: "Flats & Ballerinas", slug: "flats-ballerinas", parent: shoesCat._id, order: 2 },
      { name: "Sneakers", slug: "sneakers", parent: shoesCat._id, order: 3 },
      { name: "Sandals", slug: "sandals", parent: shoesCat._id, order: 4 },
      { name: "Boots", slug: "boots", parent: shoesCat._id, order: 5 },
    ]);

    // --- Products ---
    console.log("📦 Creating products...");
    await Product.insertMany([
      {
        title: "Elegant Silk Evening Dress",
        slug: "elegant-silk-evening-dress",
        shortDescription: "A stunning silk dress perfect for evening occasions",
        description: "This beautiful evening dress is crafted from premium silk fabric. Features a flattering A-line silhouette with delicate detailing. Perfect for cocktail parties, formal events, and special occasions.",
        category: fashionCat._id,
        subCategory: "Dresses",
        images: ["/placeholder-dress-1.jpg"],
        regularPrice: 150,
        salePrice: 30,
        discountPercent: 80,
        sizes: ["S", "M", "L", "XL"],
        colors: [{ name: "Black", code: "#000000" }, { name: "Red", code: "#E74C3C" }, { name: "Navy", code: "#1A1A2E" }],
        stock: 50,
        sku: "LF-DR-001",
        tags: ["dress", "evening", "silk", "elegant"],
        featured: true,
        newArrival: true,
        status: "active",
        ratings: { average: 4.8, count: 125 },
      },
      {
        title: "Classic White Blouse",
        slug: "classic-white-blouse",
        shortDescription: "Timeless white blouse for every wardrobe",
        description: "A must-have classic white blouse made from breathable cotton. Features a relaxed fit with button-down front. Versatile piece that pairs with everything.",
        category: fashionCat._id,
        subCategory: "Tops & Blouses",
        images: ["/placeholder-top-1.jpg"],
        regularPrice: 80,
        salePrice: 16,
        discountPercent: 80,
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: [{ name: "White", code: "#FFFFFF" }, { name: "Cream", code: "#E8D5B7" }],
        stock: 75,
        sku: "LF-TP-001",
        tags: ["blouse", "white", "classic", "cotton"],
        featured: true,
        status: "active",
        ratings: { average: 4.6, count: 89 },
      },
      {
        title: "High-Waisted Slim Jeans",
        slug: "high-waisted-slim-jeans",
        shortDescription: "Flattering high-waisted jeans with slim fit",
        description: "Premium denim high-waisted jeans with a slim fit silhouette. Stretchy comfort fabric for all-day wear. Classic 5-pocket design.",
        category: fashionCat._id,
        subCategory: "Pants & Jeans",
        images: ["/placeholder-jeans-1.jpg"],
        regularPrice: 95,
        salePrice: 19,
        discountPercent: 80,
        sizes: ["S", "M", "L", "XL"],
        colors: [{ name: "Dark Blue", code: "#1A3A5C" }, { name: "Black", code: "#000000" }],
        stock: 60,
        sku: "LF-PJ-001",
        tags: ["jeans", "high-waisted", "slim", "denim"],
        featured: false,
        newArrival: true,
        status: "active",
        ratings: { average: 4.5, count: 67 },
      },
      {
        title: "Luxury Leather Handbag",
        slug: "luxury-leather-handbag",
        shortDescription: "Premium leather handbag with gold hardware",
        description: "Exquisite genuine leather handbag featuring gold-tone hardware and multiple compartments. Spacious interior with zip pocket. Comes with detachable shoulder strap.",
        category: bagsCat._id,
        subCategory: "Handbags",
        images: ["/placeholder-bag-1.jpg"],
        regularPrice: 200,
        salePrice: 40,
        discountPercent: 80,
        sizes: ["Free"],
        colors: [{ name: "Brown", code: "#8B4513" }, { name: "Black", code: "#000000" }, { name: "Tan", code: "#D2B48C" }],
        stock: 30,
        sku: "LF-BG-001",
        tags: ["handbag", "leather", "luxury", "gold"],
        featured: true,
        status: "active",
        ratings: { average: 4.9, count: 156 },
      },
      {
        title: "Canvas Tote Bag",
        slug: "canvas-tote-bag",
        shortDescription: "Spacious canvas tote for everyday use",
        description: "Durable canvas tote bag perfect for shopping, work, or beach. Features reinforced handles and interior pocket. Eco-friendly and stylish.",
        category: bagsCat._id,
        subCategory: "Tote Bags",
        images: ["/placeholder-tote-1.jpg"],
        regularPrice: 60,
        salePrice: 12,
        discountPercent: 80,
        sizes: ["Free"],
        colors: [{ name: "Natural", code: "#F5F5DC" }, { name: "Navy", code: "#1A1A2E" }],
        stock: 100,
        sku: "LF-BG-002",
        tags: ["tote", "canvas", "everyday", "eco"],
        featured: false,
        newArrival: true,
        status: "active",
        ratings: { average: 4.4, count: 45 },
      },
      {
        title: "Satin Clutch Evening Bag",
        slug: "satin-clutch-evening-bag",
        shortDescription: "Elegant satin clutch for special occasions",
        description: "Beautiful satin clutch bag with crystal clasp closure. Perfect for weddings, parties, and formal events. Includes chain strap.",
        category: bagsCat._id,
        subCategory: "Clutch & Evening",
        images: ["/placeholder-clutch-1.jpg"],
        regularPrice: 75,
        salePrice: 15,
        discountPercent: 80,
        sizes: ["Free"],
        colors: [{ name: "Gold", code: "#C4A35A" }, { name: "Silver", code: "#C0C0C0" }, { name: "Black", code: "#000000" }],
        stock: 40,
        sku: "LF-BG-003",
        tags: ["clutch", "evening", "satin", "party"],
        featured: true,
        status: "active",
        ratings: { average: 4.7, count: 78 },
      },
      {
        title: "Stiletto High Heels",
        slug: "stiletto-high-heels",
        shortDescription: "Classic stiletto heels for a glamorous look",
        description: "Stunning stiletto heels crafted from premium materials. 4-inch heel height with cushioned insole for comfort. Perfect for parties and formal occasions.",
        category: shoesCat._id,
        subCategory: "Heels",
        images: ["/placeholder-heels-1.jpg"],
        regularPrice: 120,
        salePrice: 24,
        discountPercent: 80,
        sizes: ["S", "M", "L", "XL"],
        colors: [{ name: "Black", code: "#000000" }, { name: "Red", code: "#E74C3C" }, { name: "Nude", code: "#E8C4A0" }],
        stock: 35,
        sku: "LF-SH-001",
        tags: ["heels", "stiletto", "party", "formal"],
        featured: true,
        status: "active",
        ratings: { average: 4.6, count: 92 },
      },
      {
        title: "Comfortable Ballet Flats",
        slug: "comfortable-ballet-flats",
        shortDescription: "Soft leather ballet flats for all-day comfort",
        description: "Ultra-comfortable ballet flats made from genuine soft leather. Cushioned footbed and flexible sole. Perfect for office, travel, and everyday wear.",
        category: shoesCat._id,
        subCategory: "Flats & Ballerinas",
        images: ["/placeholder-flats-1.jpg"],
        regularPrice: 70,
        salePrice: 14,
        discountPercent: 80,
        sizes: ["S", "M", "L", "XL"],
        colors: [{ name: "Beige", code: "#E8D5B7" }, { name: "Black", code: "#000000" }, { name: "Pink", code: "#FFB6C1" }],
        stock: 80,
        sku: "LF-SH-002",
        tags: ["flats", "ballet", "comfortable", "leather"],
        featured: false,
        newArrival: true,
        status: "active",
        ratings: { average: 4.8, count: 134 },
      },
      {
        title: "Trendy White Sneakers",
        slug: "trendy-white-sneakers",
        shortDescription: "Minimalist white sneakers for casual style",
        description: "Clean and trendy white sneakers with premium leather upper. Comfortable rubber sole with arch support. Goes with everything casual and smart-casual.",
        category: shoesCat._id,
        subCategory: "Sneakers",
        images: ["/placeholder-sneakers-1.jpg"],
        regularPrice: 90,
        salePrice: 18,
        discountPercent: 80,
        sizes: ["S", "M", "L", "XL"],
        colors: [{ name: "White", code: "#FFFFFF" }, { name: "White/Gold", code: "#FFFFF0" }],
        stock: 55,
        sku: "LF-SH-003",
        tags: ["sneakers", "white", "casual", "trendy"],
        featured: true,
        status: "active",
        ratings: { average: 4.7, count: 201 },
      },
      {
        title: "Embroidered Maxi Dress",
        slug: "embroidered-maxi-dress",
        shortDescription: "Bohemian embroidered maxi dress",
        description: "Flowing maxi dress with beautiful hand-embroidered details. Light and breezy fabric perfect for summer. Features adjustable waist tie.",
        category: fashionCat._id,
        subCategory: "Dresses",
        images: ["/placeholder-maxi-1.jpg"],
        regularPrice: 130,
        salePrice: 26,
        discountPercent: 80,
        sizes: ["S", "M", "L"],
        colors: [{ name: "White", code: "#FFFFFF" }, { name: "Sky Blue", code: "#87CEEB" }],
        stock: 25,
        sku: "LF-DR-002",
        tags: ["maxi", "embroidered", "bohemian", "summer"],
        featured: false,
        newArrival: true,
        status: "active",
        ratings: { average: 4.5, count: 56 },
      },
      {
        title: "Leather Crossbody Bag",
        slug: "leather-crossbody-bag",
        shortDescription: "Compact leather crossbody for on-the-go",
        description: "Sleek and compact crossbody bag made from genuine leather. Adjustable strap with multiple card slots and zip compartment. Hands-free convenience.",
        category: bagsCat._id,
        subCategory: "Crossbody Bags",
        images: ["/placeholder-crossbody-1.jpg"],
        regularPrice: 85,
        salePrice: 17,
        discountPercent: 80,
        sizes: ["Free"],
        colors: [{ name: "Burgundy", code: "#800020" }, { name: "Black", code: "#000000" }, { name: "Olive", code: "#808000" }],
        stock: 45,
        sku: "LF-BG-004",
        tags: ["crossbody", "leather", "compact", "everyday"],
        featured: false,
        status: "active",
        ratings: { average: 4.6, count: 88 },
      },
      {
        title: "Strappy Block Heel Sandals",
        slug: "strappy-block-heel-sandals",
        shortDescription: "Chic block heel sandals for summer",
        description: "Elegant strappy sandals with a comfortable block heel. Perfect heel height for all-day wear. Ideal for both casual and dressy occasions.",
        category: shoesCat._id,
        subCategory: "Sandals",
        images: ["/placeholder-sandals-1.jpg"],
        regularPrice: 85,
        salePrice: 17,
        discountPercent: 80,
        sizes: ["S", "M", "L", "XL"],
        colors: [{ name: "Tan", code: "#D2B48C" }, { name: "Black", code: "#000000" }, { name: "Gold", code: "#C4A35A" }],
        stock: 40,
        sku: "LF-SH-004",
        tags: ["sandals", "block heel", "strappy", "summer"],
        featured: false,
        newArrival: true,
        status: "active",
        ratings: { average: 4.4, count: 63 },
      },
    ]);

    // --- Coupons ---
    console.log("🏷️  Creating coupons...");
    await Coupon.insertMany([
      {
        code: "LUXE80",
        discountType: "percentage",
        discountValue: 80,
        minOrderAmount: 0,
        maxDiscount: 500,
        usageLimit: 10000,
        usedCount: 0,
        perUserLimit: 3,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        code: "WELCOME50",
        discountType: "percentage",
        discountValue: 50,
        minOrderAmount: 30,
        maxDiscount: 200,
        usageLimit: 5000,
        usedCount: 0,
        perUserLimit: 1,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: "active",
      },
      {
        code: "FLAT10",
        discountType: "fixed",
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscount: 10,
        usageLimit: 2000,
        usedCount: 0,
        perUserLimit: 2,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: "active",
      },
    ]);

    // --- Settings ---
    console.log("⚙️  Creating settings...");
    await Settings.create({});

    // --- Banners ---
    console.log("🖼️  Creating banners...");
    await Banner.create({
      title: "GRAND OPENING SALE",
      subtitle: "UP TO 80% OFF on Your First Order",
      description: "Chat with us to get your exclusive coupon code!",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      ctaText2: "Get 80% OFF Coupon",
      ctaLink2: "#chat",
      order: 1,
      active: true,
    });

    console.log("\\n✅ Seed data created successfully!");
    console.log("\\n📧 Admin Login:");
    console.log("   Email: admin@luxefashion.com");
    console.log("   Password: Admin@123");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedData();
`,

  // --- Server Entry ---
  "server/server.js": `const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const chatSocket = require("./socket/chatSocket");

// Load env
dotenv.config();

// Connect DB
connectDB();

// Express app
const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/admin/dashboard", require("./routes/dashboardRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "LUXE FASHION API is running 🛍️" });
});

// Socket.io
chatSocket(io);

// Make io accessible
app.set("io", io);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(\`\\n🛍️  LUXE FASHION Server running on port \${PORT}\`);
  console.log(\`📡 API: http://localhost:\${PORT}/api/health\`);
  console.log(\`💬 Socket.io: Ready\\n\`);
});
`,

  // --- Env Example ---
  "server/.env": `PORT=5000
MONGO_URI=mongodb://localhost:27017/luxe-fashion
JWT_SECRET=luxe_fashion_jwt_secret_key_2025_super_secure
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Cloudinary (optional — for image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
`,

  // --- Server package.json ---
  "server/package.json": `{
  "name": "luxe-fashion-server",
  "version": "1.0.0",
  "description": "LUXE FASHION E-Commerce Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.4",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
`,

  // ========================
  // 🎨 CLIENT (Frontend)
  // ========================

  // --- Context ---
  "client/src/context/AuthContext.jsx": `// Auth Context — user state, login, register, logout
// TODO: Implement in STEP 2
import { createContext } from "react";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
`,

  "client/src/context/CartContext.jsx": `// Cart Context — cart state, add/remove/update, coupon
// TODO: Implement in STEP 9
import { createContext } from "react";
export const CartContext = createContext();
export const CartProvider = ({ children }) => <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
`,

  "client/src/context/ChatContext.jsx": `// Chat Context — socket connection, messages, toggle
// TODO: Implement in STEP 5
import { createContext } from "react";
export const ChatContext = createContext();
export const ChatProvider = ({ children }) => <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
`,

  "client/src/context/WishlistContext.jsx": `// Wishlist Context
// TODO: Implement in STEP 9
import { createContext } from "react";
export const WishlistContext = createContext();
export const WishlistProvider = ({ children }) => <WishlistContext.Provider value={{}}>{children}</WishlistContext.Provider>;
`,

  // --- Hooks ---
  "client/src/hooks/useAuth.js": `// TODO: Implement in STEP 2
export default function useAuth() { return {}; }
`,

  "client/src/hooks/useCart.js": `// TODO: Implement in STEP 9
export default function useCart() { return {}; }
`,

  "client/src/hooks/useProducts.js": `// TODO: Implement in STEP 8
export default function useProducts() { return {}; }
`,

  "client/src/hooks/useChat.js": `// TODO: Implement in STEP 5
export default function useChat() { return {}; }
`,

  // --- Utils ---
  "client/src/utils/api.js": `import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("luxe_token");
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("luxe_token");
      localStorage.removeItem("luxe_user");
    }
    return Promise.reject(error);
  }
);

export default api;
`,

  "client/src/utils/helpers.js": `export const formatPrice = (price) => \`$\${Number(price).toFixed(2)}\`;

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const getDiscountPercent = (regular, sale) => {
  if (!regular || !sale) return 0;
  return Math.round(((regular - sale) / regular) * 100);
};

export const slugify = (text) => text.toString().toLowerCase().trim().replace(/\\s+/g, "-").replace(/[^\\w-]+/g, "");

export const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  inTransit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};
`,

  "client/src/utils/constants.js": `export const SITE_NAME = "LUXE FASHION";
export const TAGLINE = "Elegance Redefined — Style That Speaks";
export const CURRENCY = "$";

export const COLORS = {
  primary: "#1A1A2E",
  secondary: "#C4A35A",
  accent: "#E8D5B7",
  background: "#FFFFFF",
  text: "#333333",
  sale: "#E74C3C",
  success: "#28A745",
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const ORDER_STATUSES = [
  { key: "pending", label: "Pending", color: "yellow" },
  { key: "confirmed", label: "Confirmed", color: "blue" },
  { key: "processing", label: "Processing", color: "indigo" },
  { key: "shipped", label: "Shipped", color: "purple" },
  { key: "inTransit", label: "In Transit", color: "orange" },
  { key: "delivered", label: "Delivered", color: "green" },
  { key: "cancelled", label: "Cancelled", color: "red" },
  { key: "returned", label: "Returned", color: "gray" },
];
`,

  // --- Layout Components ---
  "client/src/components/layout/AnnouncementBar.jsx": `// TODO: Implement in STEP 6
export default function AnnouncementBar() { return <div className="bg-[#1A1A2E] text-white text-center py-2 text-sm">🚚 FREE SHIPPING on orders over $50 | 💬 Chat for 80% OFF!</div>; }
`,

  "client/src/components/layout/Header.jsx": `// TODO: Implement in STEP 6
export default function Header() { return <header className="bg-white shadow p-4"><h1 className="text-2xl font-bold">LUXE FASHION</h1></header>; }
`,

  "client/src/components/layout/Footer.jsx": `// TODO: Implement in STEP 6
export default function Footer() { return <footer className="bg-[#1A1A2E] text-white p-8 text-center">© 2025 LUXE FASHION. All Rights Reserved.</footer>; }
`,

  "client/src/components/layout/MobileBottomNav.jsx": `// TODO: Implement in STEP 6
export default function MobileBottomNav() { return null; }
`,

  "client/src/components/layout/SearchOverlay.jsx": `// TODO: Implement in STEP 10
export default function SearchOverlay() { return null; }
`,

  // --- Common Components ---
  "client/src/components/common/Button.jsx": `// TODO: Implement in STEP 6
export default function Button({ children, ...props }) { return <button className="bg-[#C4A35A] text-white px-6 py-2 rounded hover:opacity-90" {...props}>{children}</button>; }
`,

  "client/src/components/common/Input.jsx": `// TODO: Implement in STEP 6
export default function Input(props) { return <input className="border rounded px-4 py-2 w-full focus:ring-2 focus:ring-[#C4A35A] outline-none" {...props} />; }
`,

  "client/src/components/common/Modal.jsx": `// TODO: Implement in STEP 6
export default function Modal({ isOpen, onClose, children }) { if (!isOpen) return null; return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"><button onClick={onClose} className="float-right">✕</button>{children}</div></div>; }
`,

  "client/src/components/common/Toast.jsx": `// TODO: Implement in STEP 6
export default function Toast() { return null; }
`,

  "client/src/components/common/Spinner.jsx": `export default function Spinner() { return <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-[#C4A35A] border-t-transparent rounded-full animate-spin"></div></div>; }
`,

  "client/src/components/common/Rating.jsx": `// TODO: Implement in STEP 6
export default function Rating({ value = 0 }) { return <span>{"⭐".repeat(Math.floor(value))}</span>; }
`,

  "client/src/components/common/Breadcrumb.jsx": `// TODO: Implement in STEP 6
export default function Breadcrumb({ items = [] }) { return <nav className="text-sm text-gray-500 mb-4">{items.join(" > ")}</nav>; }
`,

  "client/src/components/common/Pagination.jsx": `// TODO: Implement in STEP 6
export default function Pagination() { return null; }
`,

  "client/src/components/common/ScrollToTop.jsx": `// TODO: Implement in STEP 6
export default function ScrollToTop() { return null; }
`,

  // --- Home Components ---
  "client/src/components/home/HeroSection.jsx": `// TODO: Implement in STEP 7
export default function HeroSection() { return <section className="h-screen bg-gradient-to-r from-[#1A1A2E] to-[#2D2D44] flex items-center justify-center text-white text-center"><div><h1 className="text-5xl font-bold mb-4">GRAND OPENING SALE</h1><p className="text-2xl mb-8">UP TO 80% OFF</p></div></section>; }
`,

  "client/src/components/home/CategoryShowcase.jsx": `// TODO: Implement in STEP 7
export default function CategoryShowcase() { return <section className="py-16"><h2 className="text-3xl text-center font-bold mb-8">Shop By Category</h2></section>; }
`,

  "client/src/components/home/FeaturedProducts.jsx": `// TODO: Implement in STEP 7
export default function FeaturedProducts() { return <section className="py-16 bg-gray-50"><h2 className="text-3xl text-center font-bold mb-8">✨ Trending Now</h2></section>; }
`,

  "client/src/components/home/PromoBanner.jsx": `// TODO: Implement in STEP 7
export default function PromoBanner() { return <section className="py-16 bg-[#1A1A2E] text-white text-center"><h2 className="text-3xl font-bold">🎁 Get 80% OFF — Chat Now!</h2></section>; }
`,

  "client/src/components/home/NewArrivals.jsx": `// TODO: Implement in STEP 7
export default function NewArrivals() { return <section className="py-16"><h2 className="text-3xl text-center font-bold mb-8">🆕 New Arrivals</h2></section>; }
`,

  "client/src/components/home/WhyChooseUs.jsx": `// TODO: Implement in STEP 7
export default function WhyChooseUs() { return <section className="py-16 bg-gray-50"><h2 className="text-3xl text-center font-bold mb-8">Why Choose Us</h2></section>; }
`,

  "client/src/components/home/Testimonials.jsx": `// TODO: Implement in STEP 7
export default function Testimonials() { return <section className="py-16"><h2 className="text-3xl text-center font-bold mb-8">💕 Customer Reviews</h2></section>; }
`,

  "client/src/components/home/InstagramFeed.jsx": `// TODO: Implement in STEP 7
export default function InstagramFeed() { return <section className="py-16 bg-gray-50"><h2 className="text-3xl text-center font-bold mb-8">📸 Follow Us</h2></section>; }
`,

  "client/src/components/home/NewsletterSection.jsx": `// TODO: Implement in STEP 7
export default function NewsletterSection() { return <section className="py-16 bg-[#E8D5B7]"><h2 className="text-3xl text-center font-bold mb-8">✉️ Join The LUXE Family</h2></section>; }
`,

  // --- Product Components ---
  "client/src/components/products/ProductCard.jsx": `// TODO: Implement in STEP 7
export default function ProductCard({ product }) { return <div className="border rounded-lg p-4 hover:shadow-lg transition"><h3 className="font-bold">{product?.title || "Product"}</h3></div>; }
`,

  "client/src/components/products/ProductGrid.jsx": `// TODO: Implement in STEP 8
export default function ProductGrid() { return null; }
`,

  "client/src/components/products/ProductFilters.jsx": `// TODO: Implement in STEP 8
export default function ProductFilters() { return null; }
`,

  "client/src/components/products/QuickViewModal.jsx": `// TODO: Implement in STEP 8
export default function QuickViewModal() { return null; }
`,

  "client/src/components/products/ImageGallery.jsx": `// TODO: Implement in STEP 8
export default function ImageGallery() { return null; }
`,

  "client/src/components/products/ReviewSection.jsx": `// TODO: Implement in STEP 8
export default function ReviewSection() { return null; }
`,

  "client/src/components/products/RelatedProducts.jsx": `// TODO: Implement in STEP 8
export default function RelatedProducts() { return null; }
`,

  // --- Cart Components ---
  "client/src/components/cart/CartItem.jsx": `// TODO: Implement in STEP 9
export default function CartItem() { return null; }
`,

  "client/src/components/cart/CartSummary.jsx": `// TODO: Implement in STEP 9
export default function CartSummary() { return null; }
`,

  "client/src/components/cart/CartSidebar.jsx": `// TODO: Implement in STEP 9
export default function CartSidebar() { return null; }
`,

  // --- Checkout Components ---
  "client/src/components/checkout/CheckoutForm.jsx": `// TODO: Implement in STEP 9
export default function CheckoutForm() { return null; }
`,

  "client/src/components/checkout/OrderSummary.jsx": `// TODO: Implement in STEP 9
export default function OrderSummary() { return null; }
`,

  // --- Chat Components ---
  "client/src/components/chat/ChatWidget.jsx": `// TODO: Implement in STEP 5
export default function ChatWidget() { return <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#C4A35A] text-white rounded-full shadow-lg text-2xl animate-bounce z-50">💬</button>; }
`,

  "client/src/components/chat/ChatWindow.jsx": `// TODO: Implement in STEP 5
export default function ChatWindow() { return null; }
`,

  "client/src/components/chat/ChatMessage.jsx": `// TODO: Implement in STEP 5
export default function ChatMessage() { return null; }
`,

  // --- Account Components ---
  "client/src/components/account/LoginForm.jsx": `// TODO: Implement in STEP 2
export default function LoginForm() { return null; }
`,

  "client/src/components/account/RegisterForm.jsx": `// TODO: Implement in STEP 2
export default function RegisterForm() { return null; }
`,

  "client/src/components/account/OrderHistory.jsx": `// TODO: Implement in STEP 9
export default function OrderHistory() { return null; }
`,

  "client/src/components/account/WishlistGrid.jsx": `// TODO: Implement in STEP 9
export default function WishlistGrid() { return null; }
`,

  "client/src/components/account/AddressForm.jsx": `// TODO: Implement in STEP 9
export default function AddressForm() { return null; }
`,

  // --- Admin Components ---
  "client/src/components/admin/AdminLayout.jsx": `// TODO: Implement in STEP 11
export default function AdminLayout({ children }) { return <div className="flex"><aside className="w-64 bg-[#1A1A2E] text-white min-h-screen p-4"><h2 className="text-xl font-bold mb-8">👑 ADMIN</h2></aside><main className="flex-1 p-6 bg-gray-100">{children}</main></div>; }
`,

  "client/src/components/admin/AdminSidebar.jsx": `// TODO: Implement in STEP 11
export default function AdminSidebar() { return null; }
`,

  "client/src/components/admin/AdminHeader.jsx": `// TODO: Implement in STEP 11
export default function AdminHeader() { return null; }
`,

  "client/src/components/admin/StatsCard.jsx": `// TODO: Implement in STEP 11
export default function StatsCard({ title, value, icon }) { return <div className="bg-white rounded-lg shadow p-6"><p className="text-gray-500">{title}</p><h3 className="text-2xl font-bold">{value}</h3></div>; }
`,

  "client/src/components/admin/DataTable.jsx": `// TODO: Implement in STEP 11
export default function DataTable() { return null; }
`,

  "client/src/components/admin/Charts.jsx": `// TODO: Implement in STEP 11
export default function Charts() { return null; }
`,

  // --- Pages ---
  "client/src/pages/Home.jsx": `import HeroSection from "../components/home/HeroSection";
import CategoryShowcase from "../components/home/CategoryShowcase";
import FeaturedProducts from "../components/home/FeaturedProducts";
import PromoBanner from "../components/home/PromoBanner";
import NewArrivals from "../components/home/NewArrivals";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import InstagramFeed from "../components/home/InstagramFeed";
import NewsletterSection from "../components/home/NewsletterSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoBanner />
      <NewArrivals />
      <WhyChooseUs />
      <Testimonials />
      <InstagramFeed />
      <NewsletterSection />
    </div>
  );
}
`,

  "client/src/pages/Shop.jsx": `// TODO: Implement in STEP 8
export default function Shop() { return <div className="p-8"><h1 className="text-3xl font-bold">🛍️ Shop All</h1></div>; }
`,

  "client/src/pages/CategoryPage.jsx": `// TODO: Implement in STEP 8
export default function CategoryPage() { return <div className="p-8"><h1 className="text-3xl font-bold">Category</h1></div>; }
`,

  "client/src/pages/ProductDetail.jsx": `// TODO: Implement in STEP 8
export default function ProductDetail() { return <div className="p-8"><h1 className="text-3xl font-bold">Product Detail</h1></div>; }
`,

  "client/src/pages/Cart.jsx": `// TODO: Implement in STEP 9
export default function Cart() { return <div className="p-8"><h1 className="text-3xl font-bold">🛒 Shopping Cart</h1></div>; }
`,

  "client/src/pages/Checkout.jsx": `// TODO: Implement in STEP 9
export default function Checkout() { return <div className="p-8"><h1 className="text-3xl font-bold">🔒 Checkout</h1></div>; }
`,

  "client/src/pages/OrderConfirmation.jsx": `// TODO: Implement in STEP 9
export default function OrderConfirmation() { return <div className="p-8 text-center"><h1 className="text-3xl font-bold text-green-600">✅ Order Confirmed!</h1></div>; }
`,

  "client/src/pages/Login.jsx": `// TODO: Implement in STEP 2
export default function Login() { return <div className="p-8"><h1 className="text-3xl font-bold">Login</h1></div>; }
`,

  "client/src/pages/Register.jsx": `// TODO: Implement in STEP 2
export default function Register() { return <div className="p-8"><h1 className="text-3xl font-bold">Register</h1></div>; }
`,

  "client/src/pages/Search.jsx": `// TODO: Implement in STEP 10
export default function Search() { return <div className="p-8"><h1 className="text-3xl font-bold">🔍 Search Results</h1></div>; }
`,

  "client/src/pages/AboutUs.jsx": `// TODO: Implement in STEP 10
export default function AboutUs() { return <div className="p-8"><h1 className="text-3xl font-bold">About Us</h1></div>; }
`,

  "client/src/pages/Contact.jsx": `// TODO: Implement in STEP 10
export default function Contact() { return <div className="p-8"><h1 className="text-3xl font-bold">Contact Us</h1></div>; }
`,

  "client/src/pages/FAQ.jsx": `// TODO: Implement in STEP 10
export default function FAQ() { return <div className="p-8"><h1 className="text-3xl font-bold">❓ FAQ</h1></div>; }
`,

  "client/src/pages/PrivacyPolicy.jsx": `// TODO: Implement in STEP 10
export default function PrivacyPolicy() { return <div className="p-8"><h1 className="text-3xl font-bold">Privacy Policy</h1></div>; }
`,

  "client/src/pages/TermsConditions.jsx": `// TODO: Implement in STEP 10
export default function TermsConditions() { return <div className="p-8"><h1 className="text-3xl font-bold">Terms & Conditions</h1></div>; }
`,

  "client/src/pages/ReturnPolicy.jsx": `// TODO: Implement in STEP 10
export default function ReturnPolicy() { return <div className="p-8"><h1 className="text-3xl font-bold">Return Policy</h1></div>; }
`,

  "client/src/pages/ShippingPolicy.jsx": `// TODO: Implement in STEP 10
export default function ShippingPolicy() { return <div className="p-8"><h1 className="text-3xl font-bold">Shipping Policy</h1></div>; }
`,

  "client/src/pages/NotFound.jsx": `import { Link } from "react-router-dom";
export default function NotFound() { 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-9xl font-bold text-[#C4A35A]">404</h1>
      <h2 className="text-3xl font-bold mt-4 mb-2">Oops! Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="bg-[#C4A35A] text-white px-8 py-3 rounded-lg hover:opacity-90 font-semibold">Back to Home</Link>
    </div>
  ); 
}
`,

  // --- Account Pages ---
  "client/src/pages/account/Dashboard.jsx": `// TODO: Implement in STEP 2
export default function Dashboard() { return <div className="p-8"><h1 className="text-3xl font-bold">My Account</h1></div>; }
`,

  "client/src/pages/account/Orders.jsx": `// TODO: Implement in STEP 9
export default function Orders() { return <div className="p-8"><h1 className="text-3xl font-bold">My Orders</h1></div>; }
`,

  "client/src/pages/account/OrderDetail.jsx": `// TODO: Implement in STEP 9
export default function OrderDetail() { return <div className="p-8"><h1 className="text-3xl font-bold">Order Details</h1></div>; }
`,

  "client/src/pages/account/Wishlist.jsx": `// TODO: Implement in STEP 9
export default function Wishlist() { return <div className="p-8"><h1 className="text-3xl font-bold">❤️ My Wishlist</h1></div>; }
`,

  "client/src/pages/account/Addresses.jsx": `// TODO: Implement in STEP 9
export default function Addresses() { return <div className="p-8"><h1 className="text-3xl font-bold">My Addresses</h1></div>; }
`,

  "client/src/pages/account/Profile.jsx": `// TODO: Implement in STEP 2
export default function Profile() { return <div className="p-8"><h1 className="text-3xl font-bold">Profile Settings</h1></div>; }
`,

  // --- Admin Pages ---
  "client/src/pages/admin/AdminLogin.jsx": `// TODO: Implement in STEP 12
export default function AdminLogin() { return <div className="min-h-screen flex items-center justify-center bg-[#1A1A2E]"><div className="bg-white p-8 rounded-lg shadow-lg w-96"><h1 className="text-2xl font-bold text-center mb-6">👑 Admin Login</h1></div></div>; }
`,

  "client/src/pages/admin/AdminDashboard.jsx": `// TODO: Implement in STEP 11
export default function AdminDashboard() { return <div><h1 className="text-2xl font-bold">📊 Dashboard</h1></div>; }
`,

  "client/src/pages/admin/AdminProducts.jsx": `// TODO: Implement in STEP 11
export default function AdminProducts() { return <div><h1 className="text-2xl font-bold">📦 Products</h1></div>; }
`,

  "client/src/pages/admin/AdminAddProduct.jsx": `// TODO: Implement in STEP 11
export default function AdminAddProduct() { return <div><h1 className="text-2xl font-bold">➕ Add Product</h1></div>; }
`,

  "client/src/pages/admin/AdminEditProduct.jsx": `// TODO: Implement in STEP 11
export default function AdminEditProduct() { return <div><h1 className="text-2xl font-bold">✏️ Edit Product</h1></div>; }
`,

  "client/src/pages/admin/AdminCategories.jsx": `// TODO: Implement in STEP 11
export default function AdminCategories() { return <div><h1 className="text-2xl font-bold">📁 Categories</h1></div>; }
`,

  "client/src/pages/admin/AdminOrders.jsx": `// TODO: Implement in STEP 11
export default function AdminOrders() { return <div><h1 className="text-2xl font-bold">📋 Orders</h1></div>; }
`,

  "client/src/pages/admin/AdminOrderDetail.jsx": `// TODO: Implement in STEP 11
export default function AdminOrderDetail() { return <div><h1 className="text-2xl font-bold">📋 Order Detail</h1></div>; }
`,

  "client/src/pages/admin/AdminCustomers.jsx": `// TODO: Implement in STEP 12
export default function AdminCustomers() { return <div><h1 className="text-2xl font-bold">👥 Customers</h1></div>; }
`,

  "client/src/pages/admin/AdminCoupons.jsx": `// TODO: Implement in STEP 12
export default function AdminCoupons() { return <div><h1 className="text-2xl font-bold">🏷️ Coupons</h1></div>; }
`,

  "client/src/pages/admin/AdminChat.jsx": `// TODO: Implement in STEP 12
export default function AdminChat() { return <div><h1 className="text-2xl font-bold">💬 Chat</h1></div>; }
`,

  "client/src/pages/admin/AdminReviews.jsx": `// TODO: Implement in STEP 12
export default function AdminReviews() { return <div><h1 className="text-2xl font-bold">⭐ Reviews</h1></div>; }
`,

  "client/src/pages/admin/AdminMedia.jsx": `// TODO: Implement in STEP 12
export default function AdminMedia() { return <div><h1 className="text-2xl font-bold">📸 Media</h1></div>; }
`,

  "client/src/pages/admin/AdminPages.jsx": `// TODO: Implement in STEP 12
export default function AdminPages() { return <div><h1 className="text-2xl font-bold">📄 Pages</h1></div>; }
`,

  "client/src/pages/admin/AdminNewsletter.jsx": `// TODO: Implement in STEP 12
export default function AdminNewsletter() { return <div><h1 className="text-2xl font-bold">📧 Newsletter</h1></div>; }
`,

  "client/src/pages/admin/AdminReports.jsx": `// TODO: Implement in STEP 12
export default function AdminReports() { return <div><h1 className="text-2xl font-bold">📊 Reports</h1></div>; }
`,

  "client/src/pages/admin/AdminSettings.jsx": `// TODO: Implement in STEP 12
export default function AdminSettings() { return <div><h1 className="text-2xl font-bold">⚙️ Settings</h1></div>; }
`,

  // --- App.jsx ---
  "client/src/App.jsx": `import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ChatProvider } from "./context/ChatContext";

// Layout
import AnnouncementBar from "./components/layout/AnnouncementBar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import ChatWidget from "./components/chat/ChatWidget";
import ScrollToTop from "./components/common/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import NotFound from "./pages/NotFound";

// Account Pages
import Dashboard from "./pages/account/Dashboard";
import Orders from "./pages/account/Orders";
import OrderDetail from "./pages/account/OrderDetail";
import Wishlist from "./pages/account/Wishlist";
import Addresses from "./pages/account/Addresses";
import Profile from "./pages/account/Profile";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminChat from "./pages/admin/AdminChat";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminPages from "./pages/admin/AdminPages";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

// Public Layout Wrapper
function PublicLayout({ children }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <MobileBottomNav />
      <ChatWidget />
      <ScrollToTop />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
              <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
              <Route path="/product/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
              <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
              <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
              <Route path="/order-confirmation" element={<PublicLayout><OrderConfirmation /></PublicLayout>} />
              <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutUs /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
              <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><TermsConditions /></PublicLayout>} />
              <Route path="/return-policy" element={<PublicLayout><ReturnPolicy /></PublicLayout>} />
              <Route path="/shipping-policy" element={<PublicLayout><ShippingPolicy /></PublicLayout>} />

              {/* Auth Routes */}
              <Route path="/account/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/account/register" element={<PublicLayout><Register /></PublicLayout>} />

              {/* User Account Routes */}
              <Route path="/account/dashboard" element={<PublicLayout><Dashboard /></PublicLayout>} />
              <Route path="/account/orders" element={<PublicLayout><Orders /></PublicLayout>} />
              <Route path="/account/orders/:id" element={<PublicLayout><OrderDetail /></PublicLayout>} />
              <Route path="/account/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
              <Route path="/account/addresses" element={<PublicLayout><Addresses /></PublicLayout>} />
              <Route path="/account/profile" element={<PublicLayout><Profile /></PublicLayout>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
              <Route path="/admin/products/add" element={<AdminLayout><AdminAddProduct /></AdminLayout>} />
              <Route path="/admin/products/edit/:id" element={<AdminLayout><AdminEditProduct /></AdminLayout>} />
              <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/orders/:id" element={<AdminLayout><AdminOrderDetail /></AdminLayout>} />
              <Route path="/admin/customers" element={<AdminLayout><AdminCustomers /></AdminLayout>} />
              <Route path="/admin/coupons" element={<AdminLayout><AdminCoupons /></AdminLayout>} />
              <Route path="/admin/chat" element={<AdminLayout><AdminChat /></AdminLayout>} />
              <Route path="/admin/reviews" element={<AdminLayout><AdminReviews /></AdminLayout>} />
              <Route path="/admin/media" element={<AdminLayout><AdminMedia /></AdminLayout>} />
              <Route path="/admin/pages" element={<AdminLayout><AdminPages /></AdminLayout>} />
              <Route path="/admin/newsletter" element={<AdminLayout><AdminNewsletter /></AdminLayout>} />
              <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />

              {/* 404 */}
              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </Router>
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
`,

  // --- index.jsx ---
  "client/src/index.jsx": `import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,

  // --- index.css ---
  "client/src/index.css": `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Great+Vibes&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Poppins', sans-serif;
  color: #333333;
  background-color: #FFFFFF;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #C4A35A;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #A8893D;
}

@layer components {
  .btn-primary {
    @apply bg-[#C4A35A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#A8893D] transition-all duration-300;
  }
  .btn-outline {
    @apply border-2 border-[#C4A35A] text-[#C4A35A] px-6 py-3 rounded-lg font-semibold hover:bg-[#C4A35A] hover:text-white transition-all duration-300;
  }
  .btn-dark {
    @apply bg-[#1A1A2E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2D2D44] transition-all duration-300;
  }
}
`,

  // --- tailwind.config.js ---
  "client/tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A2E",
        secondary: "#C4A35A",
        accent: "#E8D5B7",
        dark: "#333333",
        sale: "#E74C3C",
        success: "#28A745",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "serif"],
        body: ['"Poppins"', "sans-serif"],
        script: ['"Great Vibes"', "cursive"],
      },
    },
  },
  plugins: [],
};
`,

  // --- client package.json ---
  "client/package.json": `{
  "name": "luxe-fashion-client",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "react-scripts": "5.0.1",
    "axios": "^1.6.2",
    "socket.io-client": "^4.7.2",
    "react-icons": "^4.12.0",
    "lucide-react": "^0.294.0",
    "react-hot-toast": "^2.4.1",
    "react-quill": "^2.0.0",
    "recharts": "^2.10.3",
    "swiper": "^11.0.5",
    "react-helmet-async": "^2.0.3"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
`,

  // --- PostCSS ---
  "client/postcss.config.js": `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

  // --- Public HTML ---
  "client/public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#1A1A2E" />
  <meta name="description" content="LUXE FASHION — Elegance Redefined. Premium Women's Fashion, Bags & Shoes. Up to 80% OFF!" />
  <title>LUXE FASHION — Elegance Redefined</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>
`,

  // --- Root files ---
  "README.md": `# 🛍️ LUXE FASHION — E-Commerce Website

## Premium Women's Fashion, Bags & Shoes

### Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time Chat:** Socket.io
- **Auth:** JWT

---

### 🚀 Setup Instructions

#### 1. Clone & Install

\`\`\`bash
git clone <repo-url>
cd luxe-fashion

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
\`\`\`

#### 2. Environment Setup

Create \`server/.env\` file (already created with defaults)

Edit MongoDB URI if needed.

#### 3. Seed Database

\`\`\`bash
cd server
node seed.js
\`\`\`

#### 4. Run Application

\`\`\`bash
# Terminal 1 — Start Server
cd server
npm run dev

# Terminal 2 — Start Client
cd client
npm start
\`\`\`

#### 5. Access

- **Website:** http://localhost:3000
- **API:** http://localhost:5000/api/health
- **Admin Panel:** http://localhost:3000/admin

#### 6. Admin Credentials

- **Email:** admin@luxefashion.com
- **Password:** Admin@123

---

### 📁 Project Structure

\`\`\`
luxe-fashion/
├── server/          (Backend API)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   ├── uploads/
│   ├── seed.js
│   └── server.js
│
├── client/          (React Frontend)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── utils/
│       └── App.jsx
│
└── README.md
\`\`\`

---

© 2025 LUXE FASHION. All Rights Reserved.
`,

  ".gitignore": `node_modules/
.env
server/uploads/*
!server/uploads/.gitkeep
.DS_Store
build/
dist/
*.log
`,
};

// ============================================
// 🔨 Folder & File Creation Logic
// ============================================

let fileCount = 0;
let folderCount = 0;

Object.entries(structure).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  // Create directories
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    folderCount++;
  }

  // Create file
  fs.writeFileSync(fullPath, content, "utf8");
  fileCount++;
  console.log(`  ✅ ${filePath}`);
});

console.log(`\n${"═".repeat(50)}`);
console.log(`\n🎉 LUXE FASHION Project Setup Complete!`);
console.log(`\n📁 Folders created: ${folderCount}`);
console.log(`📄 Files created: ${fileCount}`);
console.log(`\n${"═".repeat(50)}`);
console.log(`\n🚀 Next Steps:\n`);
console.log(`  1️⃣  cd server && npm install`);
console.log(`  2️⃣  cd ../client && npm install`);
console.log(`  3️⃣  cd ../server && node seed.js`);
console.log(`  4️⃣  npm run dev  (server)`);
console.log(`  5️⃣  cd ../client && npm start  (client)`);
console.log(`\n  📧 Admin: admin@luxefashion.com / Admin@123`);
console.log(`\n${"═".repeat(50)}\n`);