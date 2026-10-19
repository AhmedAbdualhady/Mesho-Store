import "./AdminProducts.css";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
FaEdit,
FaPlus,
FaRegStar,
FaSearch,
FaStar,
FaStarHalfAlt,
FaTimes,
FaTrashAlt,
} from "react-icons/fa";

import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import VariantsEditor from "../../components/VariantsEditor/VariantsEditor";
import { API_URL, asList, getDiscountPercent } from "../../utils/products";

const EMPTY_FORM = {
name: "",
description: "",
price: "",
old_price: "",
category: "",
stock: "",
rating: "0",
image: null,
discount: 0,
featured: 0,
featured_category: 0,
hero: 0,
colors: [],
sizes: "",
};

const SWITCHES = [
  { field: "discount", label: "Discount" },
  { field: "featured", label: "Featured Product" },
  { field: "featured_category", label: "Featured Category" },
  { field: "hero", label: "Hero Product" },
];

function Stars({ value }) {
const rating = Number(value) || 0;

return Array.from({ length: 5 }, (_, index) => {
const position = index + 1;

if (rating >= position) {
return <FaStar key={position} className="admin-rating-star filled" />;
    }
if (rating >= position - 0.5) {
return <FaStarHalfAlt key={position} className="admin-rating-star half" />;
    }
return <FaRegStar key={position} className="admin-rating-star empty" />;
  });
}

function AdminProducts() {
const token = localStorage.getItem("token");

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
const [showModal, setShowModal] = useState(false);
const [editId, setEditId] = useState(null);
const [preview, setPreview] = useState(null);
const [form, setForm] = useState(EMPTY_FORM);

const fetchProducts = async () => {
try {
setLoading(true);

const response = await fetch(`${API_URL}/api/products`);
const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Failed to load products");
      }

setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
console.error(error);
toast.error("Unable to load products");
    } finally {
setLoading(false);
    }
  };

useEffect(() => {
fetchProducts();
  }, []);

const categories = useMemo(
    () => [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products]
  );

const filteredProducts = products.filter(
    (product) =>
String(product.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())&&
      (category === "All" || product.category === category)
  );

const discountedCount = products.filter(
    (product) =>
Number(product.discount) === 1&&
getDiscountPercent(product.old_price, product.price) > 0
  ).length;

const outOfStockCount = products.filter(
(product) => Number(product.stock) <= 0
  ).length;

const setField = (name, value) =>
setForm((prev) => ({ ...prev, [name]: value }));

const handleChange = (event) => setField(event.target.name, event.target.value);

const openAddModal = () => {
setEditId(null);
setPreview(null);
setForm(EMPTY_FORM);
setShowModal(true);
  };

const handleEdit = (product) => {
setEditId(product.id);
setForm({
name: product.name || "",
description: product.description || "",
price: product.price ?? "",
old_price: product.old_price ?? "",
category: product.category || "",
stock: product.stock ?? "",
rating: product.rating ?? "0",
image: null,
discount: Number(product.discount) || 0,
featured: Number(product.featured) || 0,
featured_category: Number(product.featured_category) || 0,
hero: Number(product.hero) || 0,
colors: asList(product.colors).map((color) => ({
name: color.name,
hex: color.hex,
      })),
sizes: asList(product.sizes).join(", "),
    });
setPreview(
product.image ? `${API_URL}/uploads/${product.image}` : null
    );
setShowModal(true);
  };

const handleImageChange = (event) => {
const file = event.target.files?.[0];

if (!file) return;

setField("image", file);
setPreview(URL.createObjectURL(file));
  };

const handleSubmit = async (event) => {
event.preventDefault();

if (!form.name.trim()) {
toast.error("Product name is required");
return;
    }

if (!form.price) {
toast.error("Product price is required");
return;
    }

if (
form.discount === 1&&
Number(form.old_price) <= Number(form.price)
    ) {
toast.error("Old price must be greater than current price");
return;
    }

try {
setSaving(true);

const formData = new FormData();

formData.append("name", form.name);
formData.append("description", form.description);
formData.append("price", form.price);
formData.append("old_price", form.old_price);
formData.append("category", form.category);
formData.append("stock", form.stock || 0);
formData.append("rating", form.rating || 0);
formData.append("discount", form.discount ? 1 : 0);
formData.append("featured", form.featured ? 1 : 0);
formData.append("featured_category", form.featured_category ? 1 : 0);
formData.append("hero", form.hero ? 1 : 0);
formData.append(
        "colors",
JSON.stringify(form.colors.filter((color) => color.name.trim()))
      );
formData.append(
        "sizes",
JSON.stringify(
form.sizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

if (form.image instanceof File) {
formData.append("image", form.image);
      }

const response = await fetch(
editId
          ? `${API_URL}/api/products/${editId}`
          : `${API_URL}/api/products`,
        {
method: editId ? "PUT" : "POST",
headers: { Authorization: `Bearer ${token}` },
body: formData,
        }
      );

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Something went wrong");
      }

toast.success(
editId ? "Product updated successfully" : "Product added successfully"
      );

setShowModal(false);
setEditId(null);
setPreview(null);

await fetchProducts();
    } catch (error) {
console.error(error);
toast.error(error.message || "Something went wrong");
    } finally {
setSaving(false);
    }
  };

const handleDelete = async (id) => {
if (!window.confirm("Are you sure you want to delete this product?")) {
return;
    }

try {
const response = await fetch(`${API_URL}/api/products/${id}`, {
method: "DELETE",
headers: { Authorization: `Bearer ${token}` },
      });

const data = await response.json();

if (!response.ok) throw new Error(data.message || "Delete failed");

toast.success("Product deleted successfully");
fetchProducts();
    } catch (error) {
console.error(error);
toast.error(error.message || "Delete failed");
    }
  };

return (
<div className="admin-products">
<AdminSidebar />

<motion.main
className="admin-content"
initial={{ opacity: 0, y: 25 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
>
<div className="products-header">
<div>
<motion.h1
className="page-title"
initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.2, duration: 0.5 }}
>
Products Management
</motion.h1>
<p className="page-subtitle">
Manage your premium products professionally.
</p>
</div>

<button type="button" className="add-product-btn" onClick={openAddModal}>
<FaPlus />
Add Product
</button>
</div>

<div className="top-toolbar">
<div className="search-box">
<FaSearch />
<input
type="text"
placeholder="Search products..."
value={search}
onChange={(event) => setSearch(event.target.value)}
            />
            {search&& (
<button
type="button"
className="clear-btn"
onClick={() => setSearch("")}
>
<FaTimes />
</button>
            )}
</div>
</div>

<div className="stats-grid">
<div
className={category === "All" ? "mini-card active" : "mini-card"}
onClick={() => setCategory("All")}
>
<h2>{products.length}</h2>
<span>Products</span>
</div>
<div className="mini-card">
<h2>{discountedCount}</h2>
<span>Discounted</span>
</div>
<div className="mini-card">
<h2>{outOfStockCount}</h2>
<span>Out of Stock</span>
</div>
</div>

<div className="category-filter">
          {categories.map((item) => (
<button
key={item}
type="button"
className={
category === item
                  ? "category-filter-btn active"
                  : "category-filter-btn"
              }
onClick={() => setCategory(item)}
>
              {item}
</button>
          ))}
</div>

        {loading ? (
<div className="admin-loading">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
<div className="products-grid">
            {filteredProducts.map((product) => {
const discount =
Number(product.discount) === 1
                  ? getDiscountPercent(product.old_price, product.price)
                  : 0;
const inStock = Number(product.stock) > 0;
const colors = asList(product.colors);

return (
<motion.article
className="product-admin-card"
key={product.id}
whileHover={{ y: -8 }}
>
<div className="image-box">
<img
src={
product.image
                          ? `${API_URL}/uploads/${product.image}`
                          : "/placeholder.png"
                      }
alt={product.name}
className="admin-food-image"
                    />
<span className="category-badge">
                      {product.category || "Product"}
</span>
                    {discount > 0&& (
<span className="discount-badge">{discount}% OFF🔥</span>
                    )}
</div>

<div className="product-admin-info">
<div className="product-admin-badges">
                      {Number(product.featured) === 1&& (
<span className="admin-featured-badge">
Featured Product
</span>
                      )}
                      {Number(product.featured_category) === 1&& (
<span className="admin-category-featured-badge">
Featured Category
</span>
                      )}
                      {Number(product.hero) === 1&& (
<span className="admin-hero-badge">Hero</span>
                      )}
</div>

<div className="product-admin-top">
<h2>{product.name}</h2>
</div>

<p className="admin-description">
                      {product.description || "No description"}
</p>

                    {colors.length > 0&& (
<div className="admin-colors">
                        {colors.map((color) => (
<span
key={color.name}
title={color.name}
style={{ background: color.hex }}
                          />
                        ))}
</div>
                    )}

<div className="admin-rating">
<div className="admin-rating-stars">
<Stars value={product.rating} />
</div>
<span className="admin-rating-value">
                        {Number(product.rating || 0).toFixed(1)}
</span>
</div>

<div className="price-box">
                      {discount > 0&& (
<span className="admin-old-price">
                          ${Number(product.old_price).toFixed(2)}
</span>
                      )}
<span className="admin-price">
                        ${Number(product.price).toFixed(2)}
</span>
</div>

<div className={inStock ? "stock-admin in" : "stock-admin out"}>
<span />
                      {inStock ? `${product.stock} in stock` : "Out of stock"}
</div>

<div className="buttons">
<button
type="button"
className="edit-btn"
onClick={() => handleEdit(product)}
>
<FaEdit />
Edit
</button>
<button
type="button"
className="delete-btn"
onClick={() => handleDelete(product.id)}
>
<FaTrashAlt />
Delete
</button>
</div>
</div>
</motion.article>
              );
            })}
</div>
        ) : (
<div className="no-products">
<div className="no-products-icon">🔍</div>
<h2>No Products Found</h2>
<p>Add your first premium product.</p>
<button type="button" onClick={openAddModal}>
Add Product
</button>
</div>
        )}
</motion.main>

      {showModal&& (
<div className="modal" onClick={() => setShowModal(false)}>
<div className="modal-content" onClick={(event) => event.stopPropagation()}>
<div className="modal-header">
<div>
<span>✨PREMIUM PRODUCT</span>
<h2>{editId ? "Edit Product" : "Add New Product"}</h2>
</div>
<button
type="button"
className="modal-close"
onClick={() => setShowModal(false)}
>
<FaTimes />
</button>
</div>

<form onSubmit={handleSubmit}>
<label>
Product Name
<input
name="name"
placeholder="e.g. Premium Product"
value={form.name}
onChange={handleChange}
                />
</label>

<label>
Category
<input
name="category"
placeholder="e.g. Electronics"
value={form.category}
onChange={handleChange}
                />
</label>

<label>
Current Price
<input
type="number"
step="0.01"
min="0"
name="price"
placeholder="0.00"
value={form.price}
onChange={handleChange}
                />
</label>

<label>
Old Price
<input
type="number"
step="0.01"
min="0"
name="old_price"
placeholder="Optional"
value={form.old_price}
onChange={handleChange}
disabled={form.discount !== 1}
                />
</label>

              {SWITCHES.map((item) => (
<div className="switch-row" key={item.field}>
<label>{item.label}</label>
<label className="switch">
<input
type="checkbox"
checked={form[item.field] === 1}
onChange={(event) =>
setField(item.field, event.target.checked ? 1 : 0)
                      }
                    />
<span></span>
</label>
</div>
              ))}

<label>
Stock
<input
type="number"
min="0"
name="stock"
placeholder="0"
value={form.stock}
onChange={handleChange}
                />
</label>

<label>
Rating
<input
type="number"
name="rating"
min="0"
max="5"
step="0.1"
placeholder="0 - 5"
value={form.rating}
onChange={handleChange}
                />
</label>

<VariantsEditor
colors={form.colors}
sizes={form.sizes}
onColorsChange={(value) => setField("colors", value)}
onSizesChange={(value) => setField("sizes", value)}
              />

<label className="full-field">
Description
<textarea
name="description"
placeholder="Product description..."
value={form.description}
onChange={handleChange}
                />
</label>

<label className="upload-image">
<span>Choose Product Image</span>
<input
type="file"
accept="image/jpeg,image/png,image/webp"
onChange={handleImageChange}
                />
</label>

              {preview&& (
<div className="preview-box">
<img src={preview} alt="Preview" className="preview-image" />
</div>
              )}

<div className="discount-info">
                {form.discount === 1&&
Number(form.old_price) > Number(form.price)
                  ? `🔥Discount: ${getDiscountPercent(form.old_price, form.price)}%`
                  : "No discount"}
</div>

<div className="modal-buttons">
<button type="submit" className="save-btn" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editId
                    ? "Update Product"
                    : "Add Product"}
</button>
<button
type="button"
className="cancel-btn"
onClick={() => setShowModal(false)}
>
Cancel
</button>
</div>
</form>
</div>
</div>
      )}
</div>
  );
}

export default AdminProducts;

