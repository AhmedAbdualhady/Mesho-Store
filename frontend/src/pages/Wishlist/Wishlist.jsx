import "../../styles/listing.css";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaHeart, FaSearch, FaTimes } from "react-icons/fa";

import ProductCard from "../../components/ProductCard/ProductCard";
import { useWishlist } from "../../context/WishlistContext";
import { API_URL } from "../../utils/products";

function Wishlist({ setFlyItem }) {
const { wishlistItems } = useWishlist();

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");

useEffect(() => {
window.scrollTo({ top: 0, behavior: "auto" });

const loadProducts = async () => {
try {
const response = await fetch(`${API_URL}/api/products`);

if (!response.ok) throw new Error("Failed to fetch products");

const data = await response.json();

setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
console.error("Wishlist API Error:", err);
setError("Unable to load your saved products.");
      } finally {
setLoading(false);
      }
    };

loadProducts();
  }, []);

const saved = useMemo(
    () =>
products.filter((product) => wishlistItems.includes(Number(product.id))),
    [products, wishlistItems]
  );

const categories = useMemo(
    () => [
      "All",
      ...new Set(saved.map((product) => product.category).filter(Boolean)),
    ],
    [saved]
  );

const activeCategory = categories.includes(category) ? category : "All";

const filtered = useMemo(() => {
const term = search.trim().toLowerCase();

return saved.filter(
      (product) =>
        (activeCategory === "All" || product.category === activeCategory) &&
String(product.name || "")
          .toLowerCase()
          .includes(term)
    );
  }, [saved, search, activeCategory]);

const showSkeleton = loading && wishlistItems.length > 0;

return (
<motion.main
className="listing-page"
initial={{ opacity: 0, x: 60 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -60 }}
transition={{ duration: 0.45 }}
>
<header className="listing-header">
<div>
<h1>My wishlist</h1>
<p>
            {wishlistItems.length === 0
              ? "Products you save will wait for you here."
              : `${wishlistItems.length} saved ${
wishlistItems.length === 1 ? "product" : "products"
                }`}
</p>
</div>
</header>

      {showSkeleton ? (
<div className="listing-grid">
          {Array.from({ length: 4 }).map((_, index) => (
<div className="pc-skeleton" key={index}>
<div className="pc-skeleton-image" />
<div className="pc-skeleton-line large" />
<div className="pc-skeleton-line" />
<div className="pc-skeleton-line small" />
</div>
          ))}
</div>
      ) : error ? (
<div className="listing-empty">
<h2>Something went wrong</h2>
<p>{error}</p>
<button
type="button"
className="listing-btn"
onClick={() => window.location.reload()}
>
Try again
</button>
</div>
      ) : saved.length === 0 ? (
<div className="listing-empty">
<div className="listing-empty-icon">
<FaHeart />
</div>
<h2>Your wishlist is empty</h2>
<p>Tap the heart on any product to keep it here for later.</p>
<Link to="/products" className="listing-btn">
Browse products
</Link>
</div>
      ) : (
<>
<div className="listing-toolbar">
<div className="listing-search">
<FaSearch />
<input
type="text"
placeholder="Search your saved products"
value={search}
onChange={(event) => setSearch(event.target.value)}
              />
              {search&& (
<button
type="button"
className="listing-clear"
aria-label="Clear search"
onClick={() => setSearch("")}
>
<FaTimes />
</button>
              )}
</div>
</div>

          {categories.length > 2&& (
<div className="listing-chips">
              {categories.map((item) => (
<button
key={item}
type="button"
className={
activeCategory === item
                      ? "listing-chip active"
                      : "listing-chip"
                  }
onClick={() => setCategory(item)}
>
                  {item}
</button>
              ))}
</div>
          )}

          {filtered.length > 0 ? (
<div className="listing-grid">
              {filtered.map((product, index) => (
<ProductCard
key={product.id}
product={product}
index={index}
setFlyItem={setFlyItem}
                />
              ))}
</div>
          ) : (
<div className="listing-empty">
<h2>No matches</h2>
<p>None of your saved products match this search.</p>
<button
type="button"
className="listing-btn"
onClick={() => {
setSearch("");
setCategory("All");
                }}
>
Show all saved
</button>
</div>
          )}
</>
      )}
</motion.main>
  );
}

export default Wishlist;

