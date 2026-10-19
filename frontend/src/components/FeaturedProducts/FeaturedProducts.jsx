import "./FeaturedProducts.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../ProductCard/ProductCard";
import { API_URL } from "../../utils/products";

function FeaturedProducts({ setFlyItem }) {
const navigate = useNavigate();
const [products, setProducts] = useState([]);

useEffect(() => {
const loadProducts = async () => {
try {
const response = await fetch(`${API_URL}/api/products`);
const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Failed to load products");
        }

setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
console.error("Featured products error:", error);
      }
    };

loadProducts();
  }, []);

const featured = useMemo(
    () =>products.filter((product) => Number(product.featured) === 1).slice(0, 8),
    [products]
  );

return (
<section className="featured-products-section">
<div className="featured-products-header">
<div>
<span className="featured-products-label">BEST PICKS FOR YOU</span>
<h2 className="featured-products-title">Featured Products</h2>
<p className="featured-products-subtitle">
Discover our most popular products, carefully selected for you.
</p>
</div>

<button
type="button"
className="featured-products-view-all"
onClick={() => navigate("/products")}
>
View All →
</button>
</div>

<div className="featured-products-grid">
        {featured.map((product, index) => (
<ProductCard
key={product.id}
product={product}
index={index}
setFlyItem={setFlyItem}
          />
        ))}
</div>

      {featured.length === 0&& (
<div className="featured-products-empty">
No featured products available.
</div>
      )}
</section>
  );
}

export default FeaturedProducts;
