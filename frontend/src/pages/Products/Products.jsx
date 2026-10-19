import "../../styles/listing.css";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";

import ProductCard from "../../components/ProductCard/ProductCard";
import { API_URL, getDiscountPercent } from "../../utils/products";

const PAGE_SIZE = 12;

const discountOf = (product) =>
Number(product.discount) === 1
    ? getDiscountPercent(product.old_price, product.price)
    : 0;

const SORTERS = {
default: (a, b) => Number(b.featured) - Number(a.featured),
low: (a, b) => Number(a.price) - Number(b.price),
high: (a, b) => Number(b.price) - Number(a.price),
name: (a, b) => String(a.name).localeCompare(String(b.name)),
discount: (a, b) => discountOf(b) - discountOf(a),
};

function Products({ setFlyItem }) {
const [searchParams, setSearchParams] = useSearchParams();
const category = searchParams.get("category") || "All";

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [sort, setSort] = useState("default");
const [page, setPage] = useState(1);

useEffect(() => {
window.scrollTo({ top: 0, behavior: "auto" });

const loadProducts = async () => {
try {
setLoading(true);
setError("");

const response = await fetch(`${API_URL}/api/products`);

if (!response.ok) throw new Error("Failed to fetch products");

const data = await response.json();

setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
console.error("Products API Error:", err);
setError("Unable to load products. Check your connection and try again.");
      } finally {
setLoading(false);
      }
    };

loadProducts();
  }, []);

const categories = useMemo(
    () => [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products]
  );

const filtered = useMemo(() => {
const term = search.trim().toLowerCase();

return products
      .filter(
        (product) =>
          (category === "All" || product.category === category) &&
String(product.name || "")
            .toLowerCase()
            .includes(term)
      )
      .sort(SORTERS[sort]);
  }, [products, search, category, sort]);

const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
const safePage = Math.min(page, totalPages);
const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

const changeCategory = (value) => {
const next = new URLSearchParams(searchParams);

if (value === "All") next.delete("category");
else next.set("category", value);

setSearchParams(next, { replace: true });
setPage(1);
  };

const changeSearch = (value) => {
setSearch(value);
setPage(1);
  };

const changeSort = (value) => {
setSort(value);
setPage(1);
  };

const goToPage = (value) => {
setPage(value);
window.scrollTo({ top: 0, behavior: "smooth" });
  };

const resetFilters = () => {
setSearch("");
setPage(1);
changeCategory("All");
  };

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
<h1>{category === "All" ? "All products" : category}</h1>
<p>
            {loading
              ? "Loading the collection"
              : `${filtered.length} ${
filtered.length === 1 ? "product" : "products"
                }`}
</p>
</div>
</header>

<div className="listing-toolbar">
<div className="listing-search">
<FaSearch />
<input
type="text"
placeholder="Search products"
value={search}
onChange={(event) => changeSearch(event.target.value)}
          />
          {search&& (
<button
type="button"
className="listing-clear"
aria-label="Clear search"
onClick={() => changeSearch("")}
>
<FaTimes />
</button>
          )}
</div>

<select
className="listing-sort"
value={sort}
aria-label="Sort products"
onChange={(event) => changeSort(event.target.value)}
>
<option value="default">Featured first</option>
<option value="low">Price: low to high</option>
<option value="high">Price: high to low</option>
<option value="name">Name: A to Z</option>
<option value="discount">Biggest discount</option>
</select>
</div>

<div className="listing-chips">
        {categories.map((item) => (
<button
key={item}
type="button"
className={category === item ? "listing-chip active" : "listing-chip"}
onClick={() => changeCategory(item)}
>
            {item}
</button>
        ))}
</div>

      {error ? (
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
      ) : loading ? (
<div className="listing-grid">
          {Array.from({ length: 8 }).map((_, index) => (
<div className="pc-skeleton" key={index}>
<div className="pc-skeleton-image" />
<div className="pc-skeleton-line large" />
<div className="pc-skeleton-line" />
<div className="pc-skeleton-line small" />
</div>
          ))}
</div>
      ) : visible.length > 0 ? (
<>
<div className="listing-grid">
            {visible.map((product, index) => (
<ProductCard
key={product.id}
product={product}
index={index}
setFlyItem={setFlyItem}
              />
            ))}
</div>

          {totalPages > 1&& (
<nav className="listing-pagination" aria-label="Pagination">
<button
type="button"
disabled={safePage === 1}
onClick={() => goToPage(safePage - 1)}
>
Previous
</button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
<button
key={number}
type="button"
className={number === safePage ? "active" : ""}
onClick={() => goToPage(number)}
>
                    {number}
</button>
                )
              )}

<button
type="button"
disabled={safePage === totalPages}
onClick={() => goToPage(safePage + 1)}
>
Next
</button>
</nav>
          )}
</>
      ) : (
<div className="listing-empty">
<h2>No products found</h2>
<p>Try a different search or pick another category.</p>
<button type="button" className="listing-btn" onClick={resetFilters}>
Show all products
</button>
</div>
      )}
</motion.main>
  );
}

export default Products;
