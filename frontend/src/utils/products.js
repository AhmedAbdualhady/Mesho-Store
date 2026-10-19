export const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getImageUrl = (item) => {
if (!item?.image) return "/placeholder.png";
if (item.image.startsWith("http")) return item.image;
return `${API_URL}/uploads/${item.image}`;
};

export const getDiscountPercent = (oldPrice, price) => {
const oldValue = Number(oldPrice);
const newValue = Number(price);

if (!oldValue || !newValue || oldValue <= newValue) return 0;

return Math.round(((oldValue - newValue) / oldValue) * 100);
};

export const asList = (value) => (Array.isArray(value) ? value : []);

export const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;
