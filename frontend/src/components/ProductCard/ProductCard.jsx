import "./ProductCard.css";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";

import StarRating from "../StarRating/StarRating";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
asList,
formatPrice,
getDiscountPercent,
getImageUrl,
} from "../../utils/products";

function ProductCard({ product, index = 0, setFlyItem }) {
const navigate = useNavigate();
const imageRef = useRef(null);
const { addToCart, getProductQuantity } = useCart();
const { toggleWishlist, isFavorite } = useWishlist();

const stock = Number(product.stock) || 0;
const available = Math.max(0, stock - getProductQuantity(product.id));
const soldOut = stock <= 0;
const maxed = !soldOut && available <= 0;
const discount =
Number(product.discount) === 1
      ? getDiscountPercent(product.old_price, product.price)
      : 0;
const colors = asList(product.colors);
const hasOptions = colors.length > 0 || asList(product.sizes).length > 0;
const favorite = isFavorite(product.id);

const openDetails = () => navigate(`/products/${product.id}`);

const handleAdd = (event) => {
event.stopPropagation();

if (hasOptions) {
openDetails();
return;
    }

const rect = imageRef.current?.getBoundingClientRect();
const result = addToCart(product);

if (!result.ok) {
toast.error(result.message);
return;
    }

if (rect && setFlyItem) {
setFlyItem({ image: getImageUrl(product), rect });
    }

toast.success(`${product.name} added to cart`);
  };

const buttonLabel = soldOut
    ? "Out of stock"
    : maxed
    ? "All units in your cart"
    : hasOptions
    ? "Choose options"
    : "Add to cart";

return (
<motion.article
className={soldOut ? "pc pc-sold" : "pc"}
initial={{ opacity: 0, y: 24 }}
whileInView={{ opacity: 1, y: 0 }}
whileHover={soldOut ? undefined : { y: -6 }}
viewport={{ once: true, amount: 0.1 }}
transition={{ duration: 0.4, delay: Math.min(index, 7) * 0.05 }}
onClick={openDetails}
>
<div className="pc-media">
<img
ref={imageRef}
src={getImageUrl(product)}
alt={product.name}
loading="lazy"
        />

        {soldOut&& (
<div className="pc-sold-overlay">
<span>Out of stock</span>
</div>
        )}

        {product.category&& (
<span className="pc-category">{product.category}</span>
        )}

        {discount > 0 && !soldOut&& (
<span className="pc-discount">-{discount}%</span>
        )}

<button
type="button"
className={favorite ? "pc-heart active" : "pc-heart"}
aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
onClick={(event) => {
event.stopPropagation();
toggleWishlist(product);
          }}
>
<motion.span
animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
transition={{ duration: 0.3 }}
>
<FaHeart />
</motion.span>
</button>
</div>

<div className="pc-body">
<Link
to={`/products/${product.id}`}
className="pc-name"
onClick={(event) => event.stopPropagation()}
>
          {product.name}
</Link>

<div className="pc-rating">
<StarRating rating={Number(product.rating) || 0} />
</div>

        {colors.length > 0&& (
<div className="pc-colors" aria-label="Available colors">
            {colors.slice(0, 4).map((color) => (
<span
key={color.name}
className="pc-dot"
style={{ background: color.hex }}
title={color.name}
              />
            ))}
            {colors.length > 4&& (
<span className="pc-more">+{colors.length - 4}</span>
            )}
</div>
        )}

<div className="pc-price">
<strong>{formatPrice(product.price)}</strong>
          {discount > 0 &&<del>{formatPrice(product.old_price)}</del>}
</div>

<span className={soldOut ? "pc-stock out" : "pc-stock in"}>
<i />
          {soldOut ? "Out of stock" : `${available} in stock`}
</span>

<button
type="button"
className="pc-add"
disabled={soldOut || maxed}
onClick={handleAdd}
>
          {buttonLabel}
</button>
</div>
</motion.article>
  );
}

export default ProductCard;

