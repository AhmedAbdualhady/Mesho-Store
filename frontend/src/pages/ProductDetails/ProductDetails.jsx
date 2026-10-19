import "./ProductDetails.css";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
FaAward,
FaHeart,
FaMinus,
FaPlus,
FaShieldAlt,
FaTruck,
} from "react-icons/fa";

import StarRating from "../../components/StarRating/StarRating";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
API_URL,
asList,
formatPrice,
getDiscountPercent,
getImageUrl,
} from "../../utils/products";

function ProductDetails({ setFlyItem }) {
const { id } = useParams();
const navigate = useNavigate();
const imageRef = useRef(null);
const { addToCart, getProductQuantity } = useCart();
const { toggleWishlist, isFavorite } = useWishlist();

const [state, setState] = useState({
status: "loading",
product: null,
related: [],
  });
const [color, setColor] = useState(null);
const [size, setSize] = useState(null);
const [quantity, setQuantity] = useState(1);

useEffect(() => {
let active = true;

window.scrollTo({ top: 0, behavior: "auto" });
setState({ status: "loading", product: null, related: [] });

const load = async () => {
try {
const [productResponse, listResponse] = await Promise.all([
fetch(`${API_URL}/api/products/${id}`),
fetch(`${API_URL}/api/products`),
        ]);

if (!productResponse.ok) throw new Error("Product not found");

const productData = await productResponse.json();
const listData = listResponse.ok
          ? await listResponse.json()
          : { products: [] };

if (!active) return;

const product = productData.product;
const others = asList(listData.products).filter(
(item) => Number(item.id) !== Number(product.id)
        );
const sameCategory = others.filter(
(item) => item.category && item.category === product.category
        );
const rest = others.filter((item) => !sameCategory.includes(item));

setColor(asList(product.colors)[0]?.name || null);
setSize(asList(product.sizes)[0] || null);
setQuantity(1);
setState({
status: "ready",
product,
related: [...sameCategory, ...rest].slice(0, 4),
        });
      } catch {
if (active) setState({ status: "error", product: null, related: [] });
      }
    };

load();

return () => {
active = false;
    };
  }, [id]);

const { status, product, related } = state;

if (status === "loading") {
return (
<main className="pd">
<div className="pd-layout">
<div className="pd-skeleton pd-skeleton-image" />
<div className="pd-info">
<div className="pd-skeleton pd-skeleton-line wide" />
<div className="pd-skeleton pd-skeleton-line" />
<div className="pd-skeleton pd-skeleton-line short" />
<div className="pd-skeleton pd-skeleton-block" />
</div>
</div>
</main>
    );
  }

if (status === "error") {
return (
<main className="pd">
<div className="pd-empty">
<h1>This product isn't available</h1>
<p>It may have been removed, or the link is incorrect.</p>
<button
type="button"
className="pd-add"
onClick={() => navigate("/products")}
>
Browse products
</button>
</div>
</main>
    );
  }

const colors = asList(product.colors);
const sizes = asList(product.sizes);
const stock = Number(product.stock) || 0;
const available = Math.max(0, stock - getProductQuantity(product.id));
const discount =
Number(product.discount) === 1
      ? getDiscountPercent(product.old_price, product.price)
      : 0;
const saved = discount > 0 ? Number(product.old_price) - Number(product.price) : 0;
const blocked = stock <= 0 || available <= 0;
const qty = Math.min(quantity, Math.max(1, available));
const favorite = isFavorite(product.id);
const addLabel =
stock <= 0
      ? "Out of stock"
      : available <= 0
      ? "Maximum in your cart"
      : "Add to cart";

const handleAdd = () => {
const rect = imageRef.current?.getBoundingClientRect();
const result = addToCart(product, { color, size, quantity: qty });

if (!result.ok) {
toast.error(result.message);
return;
    }

if (rect && setFlyItem) {
setFlyItem({ image: getImageUrl(product), rect });
    }

toast.success(`${product.name} added to cart`);
setQuantity(1);
  };

return (
<>
<motion.main
className="pd"
initial={{ opacity: 0, x: 60 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -60 }}
transition={{ duration: 0.45 }}
>
<nav className="pd-crumbs" aria-label="Breadcrumb">
<Link to="/">Home</Link>
<span>/</span>
<Link to="/products">Products</Link>
          {product.category&& (
<>
<span>/</span>
<Link
to={`/products?category=${encodeURIComponent(product.category)}`}
>
                {product.category}
</Link>
</>
          )}
</nav>

<section className="pd-layout">
<div className="pd-media">
<div className="pd-image">
<img
ref={imageRef}
src={getImageUrl(product)}
alt={product.name}
              />
              {discount > 0 &&<span className="pd-badge">-{discount}%</span>}
              {stock <= 0 &&<span className="pd-sold">Out of stock</span>}
</div>
</div>

<div className="pd-info">
<h1 className="pd-title">{product.name}</h1>

<div className="pd-meta">
<StarRating rating={Number(product.rating) || 0} />
<span className={stock <= 0 ? "pd-stock out" : "pd-stock in"}>
                {stock <= 0 ? "Out of stock" : `${available} in stock`}
</span>
</div>

<div className="pd-price">
<strong>{formatPrice(product.price)}</strong>
              {discount > 0&& (
<>
<del>{formatPrice(product.old_price)}</del>
<span className="pd-save">You save {formatPrice(saved)}</span>
</>
              )}
</div>

            {colors.length > 0&& (
<div className="pd-group">
<p className="pd-label">
Color: <strong>{color}</strong>
</p>
<div className="pd-swatches" role="radiogroup" aria-label="Color">
                  {colors.map((item) => (
<button
key={item.name}
type="button"
role="radio"
aria-checked={color === item.name}
aria-label={item.name}
title={item.name}
className={
color === item.name ? "pd-swatch active" : "pd-swatch"
                      }
style={{ "--swatch": item.hex }}
onClick={() => setColor(item.name)}
                    />
                  ))}
</div>
</div>
            )}

            {sizes.length > 0&& (
<div className="pd-group">
<p className="pd-label">
Size / storage: <strong>{size}</strong>
</p>
<div className="pd-chips" role="radiogroup" aria-label="Size">
                  {sizes.map((item) => (
<button
key={item}
type="button"
role="radio"
aria-checked={size === item}
className={size === item ? "pd-chip active" : "pd-chip"}
onClick={() => setSize(item)}
>
                      {item}
</button>
                  ))}
</div>
</div>
            )}

<div className="pd-buy">
<div className="pd-qty">
<button
type="button"
aria-label="Decrease quantity"
disabled={blocked || qty <= 1}
onClick={() => setQuantity(Math.max(1, qty - 1))}
>
<FaMinus />
</button>
<span>{qty}</span>
<button
type="button"
aria-label="Increase quantity"
disabled={blocked || qty >= available}
onClick={() => setQuantity(Math.min(available, qty + 1))}
>
<FaPlus />
</button>
</div>

<button
type="button"
className="pd-add"
disabled={blocked}
onClick={handleAdd}
>
                {addLabel}
</button>

<button
type="button"
className={favorite ? "pd-wish active" : "pd-wish"}
aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
onClick={() => toggleWishlist(product)}
>
<FaHeart />
</button>
</div>

<ul className="pd-trust">
<li>
<FaShieldAlt />
<span>Trusted shopping</span>
</li>
<li>
<FaTruck />
<span>Fast delivery</span>
</li>
<li>
<FaAward />
<span>Quality products</span>
</li>
</ul>

            {product.description&& (
<section className="pd-about">
<h2>About this product</h2>
<p>{product.description}</p>
</section>
            )}
</div>
</section>

        {related.length > 0&& (
<section className="pd-related">
<h2>You may also like</h2>
<div className="pd-related-grid">
              {related.map((item, index) => (
<ProductCard
key={item.id}
product={item}
index={index}
setFlyItem={setFlyItem}
                />
              ))}
</div>
</section>
        )}
</motion.main>

<div className="pd-bar">
<div>
<span>Total</span>
<strong>{formatPrice(Number(product.price) * qty)}</strong>
</div>
<button
type="button"
className="pd-add"
disabled={blocked}
onClick={handleAdd}
>
          {addLabel}
</button>
</div>
</>
  );
}

export default ProductDetails;

