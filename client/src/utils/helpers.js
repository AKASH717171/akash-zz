export const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const getDiscountPercent = (regular, sale) => {
  if (!regular || !sale) return 0;
  return Math.round(((regular - sale) / regular) * 100);
};

export const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

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
