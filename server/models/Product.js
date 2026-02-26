const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: "" },
  alt: { type: String, default: "" },
  isMain: { type: Boolean, default: false },
});

const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, default: 0 },
});

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, default: "" },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: { type: String, default: "" },
    images: [imageSchema],
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    discountPercent: { type: Number, default: 0 },
    sizes: [sizeSchema],
    colors: [colorSchema],
    stock: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    tags: [String],
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "archived", "out_of_stock"],
      default: "active",
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    materials: { type: String, default: "" },
    careInstructions: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual: effective price
productSchema.virtual("effectivePrice").get(function () {
  return this.salePrice && this.salePrice > 0 ? this.salePrice : this.regularPrice;
});

// Virtual: is on sale
productSchema.virtual("isOnSale").get(function () {
  return this.salePrice && this.salePrice > 0 && this.salePrice < this.regularPrice;
});

// Auto-calculate discount percent before save
productSchema.pre("save", function (next) {
  if (this.salePrice && this.salePrice > 0 && this.regularPrice > 0) {
    this.discountPercent = Math.round(
      ((this.regularPrice - this.salePrice) / this.regularPrice) * 100
    );
  } else {
    this.discountPercent = 0;
  }
  next();
});

// Main image helper
productSchema.virtual("mainImage").get(function () {
  if (!this.images || this.images.length === 0) return null;
  const main = this.images.find((img) => img.isMain);
  return main ? main.url : this.images[0].url;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);