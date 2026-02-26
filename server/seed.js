const mongoose = require("mongoose");
const dotenv = require("dotenv");

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

    console.log("👤 Creating admin user...");
    await User.create({ name: "Admin", email: "admin@luxefashion.com", password: "Admin@123", role: "admin", isActive: true });
    await User.create({ name: "Jane Doe", email: "jane@example.com", password: "User@123", role: "user", isActive: true });

    console.log("📁 Creating categories...");
    const fashionCat = await Category.create({ name: "Women Fashion", slug: "women-fashion", description: "Discover the latest trends in women fashion", order: 1 });
    const bagsCat = await Category.create({ name: "Bags", slug: "bags", description: "Find your perfect bag", order: 2 });
    const shoesCat = await Category.create({ name: "Shoes", slug: "shoes", description: "Step into elegance", order: 3 });

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

    console.log("📦 Creating products...");
    await Product.insertMany([
      { title: "Elegant Silk Evening Dress", slug: "elegant-silk-evening-dress", shortDescription: "A stunning silk dress perfect for evening occasions", description: "This beautiful evening dress is crafted from premium silk fabric.", category: fashionCat._id, subCategory: "Dresses", images: [{ url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600", alt: "Elegant Silk Evening Dress", isMain: true }, { url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600", alt: "Dress Back View", isMain: false }], regularPrice: 150, salePrice: 30, sizes: [{ name: "S", stock: 15 }, { name: "M", stock: 20 }, { name: "L", stock: 10 }, { name: "XL", stock: 5 }], colors: [{ name: "Black", code: "#000000" }, { name: "Red", code: "#E74C3C" }, { name: "Navy", code: "#1A1A2E" }], stock: 50, sku: "LF-DR-001", tags: ["dress", "evening", "silk"], featured: true, newArrival: true, bestSeller: true, status: "active", ratings: { average: 4.8, count: 125 }, totalSold: 342 },
      { title: "Classic White Blouse", slug: "classic-white-blouse", shortDescription: "Timeless white blouse for every wardrobe", description: "A must-have classic white blouse made from breathable cotton.", category: fashionCat._id, subCategory: "Tops & Blouses", images: [{ url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600", alt: "Classic White Blouse", isMain: true }], regularPrice: 80, salePrice: 16, sizes: [{ name: "XS", stock: 10 }, { name: "S", stock: 20 }, { name: "M", stock: 25 }, { name: "L", stock: 15 }, { name: "XL", stock: 5 }], colors: [{ name: "White", code: "#FFFFFF" }, { name: "Cream", code: "#E8D5B7" }], stock: 75, sku: "LF-TP-001", tags: ["blouse", "white", "classic"], featured: true, bestSeller: true, status: "active", ratings: { average: 4.6, count: 89 }, totalSold: 256 },
      { title: "High-Waisted Slim Jeans", slug: "high-waisted-slim-jeans", shortDescription: "Flattering high-waisted jeans with slim fit", description: "Premium denim high-waisted jeans with a slim fit silhouette.", category: fashionCat._id, subCategory: "Pants & Jeans", images: [{ url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600", alt: "High-Waisted Slim Jeans", isMain: true }], regularPrice: 95, salePrice: 19, sizes: [{ name: "S", stock: 18 }, { name: "M", stock: 22 }, { name: "L", stock: 15 }, { name: "XL", stock: 5 }], colors: [{ name: "Dark Blue", code: "#1A3A5C" }, { name: "Black", code: "#000000" }], stock: 60, sku: "LF-PJ-001", tags: ["jeans", "high-waisted"], newArrival: true, status: "active", ratings: { average: 4.5, count: 67 }, totalSold: 189 },
      { title: "Luxury Leather Handbag", slug: "luxury-leather-handbag", shortDescription: "Premium leather handbag with gold hardware", description: "Exquisite genuine leather handbag featuring gold-tone hardware.", category: bagsCat._id, subCategory: "Handbags", images: [{ url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600", alt: "Luxury Leather Handbag", isMain: true }, { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600", alt: "Handbag Side View", isMain: false }], regularPrice: 200, salePrice: 40, sizes: [{ name: "Free", stock: 30 }], colors: [{ name: "Brown", code: "#8B4513" }, { name: "Black", code: "#000000" }, { name: "Tan", code: "#D2B48C" }], stock: 30, sku: "LF-BG-001", tags: ["handbag", "leather", "luxury"], featured: true, bestSeller: true, status: "active", ratings: { average: 4.9, count: 156 }, totalSold: 478 },
      { title: "Canvas Tote Bag", slug: "canvas-tote-bag", shortDescription: "Spacious canvas tote for everyday use", description: "Durable canvas tote bag perfect for shopping, work, or beach.", category: bagsCat._id, subCategory: "Tote Bags", images: [{ url: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600", alt: "Canvas Tote Bag", isMain: true }], regularPrice: 60, salePrice: 12, sizes: [{ name: "Free", stock: 100 }], colors: [{ name: "Natural", code: "#F5F5DC" }, { name: "Navy", code: "#1A1A2E" }], stock: 100, sku: "LF-BG-002", tags: ["tote", "canvas"], newArrival: true, status: "active", ratings: { average: 4.4, count: 45 }, totalSold: 134 },
      { title: "Satin Clutch Evening Bag", slug: "satin-clutch-evening-bag", shortDescription: "Elegant satin clutch for special occasions", description: "Beautiful satin clutch bag with crystal clasp closure.", category: bagsCat._id, subCategory: "Clutch & Evening", images: [{ url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600", alt: "Satin Clutch Evening Bag", isMain: true }], regularPrice: 75, salePrice: 15, sizes: [{ name: "Free", stock: 40 }], colors: [{ name: "Gold", code: "#C4A35A" }, { name: "Silver", code: "#C0C0C0" }, { name: "Black", code: "#000000" }], stock: 40, sku: "LF-BG-003", tags: ["clutch", "evening"], featured: true, status: "active", ratings: { average: 4.7, count: 78 }, totalSold: 223 },
      { title: "Stiletto High Heels", slug: "stiletto-high-heels", shortDescription: "Classic stiletto heels for a glamorous look", description: "Stunning stiletto heels crafted from premium materials.", category: shoesCat._id, subCategory: "Heels", images: [{ url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600", alt: "Stiletto High Heels", isMain: true }], regularPrice: 120, salePrice: 24, sizes: [{ name: "S", stock: 10 }, { name: "M", stock: 15 }, { name: "L", stock: 7 }, { name: "XL", stock: 3 }], colors: [{ name: "Black", code: "#000000" }, { name: "Red", code: "#E74C3C" }, { name: "Nude", code: "#E8C4A0" }], stock: 35, sku: "LF-SH-001", tags: ["heels", "stiletto"], featured: true, bestSeller: true, status: "active", ratings: { average: 4.6, count: 92 }, totalSold: 312 },
      { title: "Comfortable Ballet Flats", slug: "comfortable-ballet-flats", shortDescription: "Soft leather ballet flats for all-day comfort", description: "Ultra-comfortable ballet flats made from genuine soft leather.", category: shoesCat._id, subCategory: "Flats & Ballerinas", images: [{ url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600", alt: "Ballet Flats", isMain: true }], regularPrice: 70, salePrice: 14, sizes: [{ name: "S", stock: 25 }, { name: "M", stock: 30 }, { name: "L", stock: 20 }, { name: "XL", stock: 5 }], colors: [{ name: "Beige", code: "#E8D5B7" }, { name: "Black", code: "#000000" }, { name: "Pink", code: "#FFB6C1" }], stock: 80, sku: "LF-SH-002", tags: ["flats", "ballet"], newArrival: true, bestSeller: true, status: "active", ratings: { average: 4.8, count: 134 }, totalSold: 445 },
      { title: "Trendy White Sneakers", slug: "trendy-white-sneakers", shortDescription: "Minimalist white sneakers for casual style", description: "Clean and trendy white sneakers with premium leather upper.", category: shoesCat._id, subCategory: "Sneakers", images: [{ url: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600", alt: "White Sneakers", isMain: true }], regularPrice: 90, salePrice: 18, sizes: [{ name: "S", stock: 15 }, { name: "M", stock: 20 }, { name: "L", stock: 15 }, { name: "XL", stock: 5 }], colors: [{ name: "White", code: "#FFFFFF" }, { name: "White/Gold", code: "#FFFFF0" }], stock: 55, sku: "LF-SH-003", tags: ["sneakers", "white"], featured: true, newArrival: true, status: "active", ratings: { average: 4.7, count: 201 }, totalSold: 567 },
      { title: "Embroidered Maxi Dress", slug: "embroidered-maxi-dress", shortDescription: "Bohemian embroidered maxi dress", description: "Flowing maxi dress with beautiful hand-embroidered details.", category: fashionCat._id, subCategory: "Dresses", images: [{ url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600", alt: "Embroidered Maxi Dress", isMain: true }], regularPrice: 130, salePrice: 26, sizes: [{ name: "S", stock: 8 }, { name: "M", stock: 12 }, { name: "L", stock: 5 }], colors: [{ name: "White", code: "#FFFFFF" }, { name: "Sky Blue", code: "#87CEEB" }], stock: 25, sku: "LF-DR-002", tags: ["maxi", "embroidered"], newArrival: true, status: "active", ratings: { average: 4.5, count: 56 }, totalSold: 98 },
      { title: "Leather Crossbody Bag", slug: "leather-crossbody-bag", shortDescription: "Compact leather crossbody for on-the-go", description: "Sleek and compact crossbody bag made from genuine leather.", category: bagsCat._id, subCategory: "Crossbody Bags", images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", alt: "Leather Crossbody Bag", isMain: true }], regularPrice: 85, salePrice: 17, sizes: [{ name: "Free", stock: 45 }], colors: [{ name: "Burgundy", code: "#800020" }, { name: "Black", code: "#000000" }, { name: "Olive", code: "#808000" }], stock: 45, sku: "LF-BG-004", tags: ["crossbody", "leather"], status: "active", ratings: { average: 4.6, count: 88 }, totalSold: 167 },
      { title: "Strappy Block Heel Sandals", slug: "strappy-block-heel-sandals", shortDescription: "Chic block heel sandals for summer", description: "Elegant strappy sandals with a comfortable block heel.", category: shoesCat._id, subCategory: "Sandals", images: [{ url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600", alt: "Block Heel Sandals", isMain: true }], regularPrice: 85, salePrice: 17, sizes: [{ name: "S", stock: 12 }, { name: "M", stock: 18 }, { name: "L", stock: 8 }, { name: "XL", stock: 2 }], colors: [{ name: "Tan", code: "#D2B48C" }, { name: "Black", code: "#000000" }, { name: "Gold", code: "#C4A35A" }], stock: 40, sku: "LF-SH-004", tags: ["sandals", "block heel"], newArrival: true, status: "active", ratings: { average: 4.4, count: 63 }, totalSold: 145 },
    ]);

    console.log("🏷️  Creating coupons...");
    await Coupon.insertMany([
      { code: "LUXE80", discountType: "percentage", discountValue: 80, minOrderAmount: 0, maxDiscount: 500, usageLimit: 10000, usedCount: 0, perUserLimit: 3, startDate: new Date(), expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: "active" },
      { code: "WELCOME50", discountType: "percentage", discountValue: 50, minOrderAmount: 30, maxDiscount: 200, usageLimit: 5000, usedCount: 0, perUserLimit: 1, startDate: new Date(), expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), status: "active" },
      { code: "FLAT10", discountType: "fixed", discountValue: 10, minOrderAmount: 50, maxDiscount: 10, usageLimit: 2000, usedCount: 0, perUserLimit: 2, startDate: new Date(), expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), status: "active" },
    ]);

    console.log("⚙️  Creating settings...");
    await Settings.create({});

    console.log("🖼️  Creating banners...");
    await Banner.create({
      image: { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200", publicId: "demo_banner" },
      title: "GRAND OPENING SALE",
      subtitle: "UP TO 80% OFF on Your First Order",
      ctaText: "Shop Now",
      ctaLink: "/shop",
      order: 1,
      active: true,
    });

    console.log("\n✅ Seed data created successfully!");
    console.log("\n📧 Admin Login:");
    console.log("   Email: admin@luxefashion.com");
    console.log("   Password: Admin@123");
    console.log("\n👤 Demo User:");
    console.log("   Email: jane@example.com");
    console.log("   Password: User@123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedData();
