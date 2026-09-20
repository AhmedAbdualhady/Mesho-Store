import {
useEffect,
useMemo,
useState,
} from "react";

import "./AdminProducts.css";

import { motion } from "framer-motion";

import {
FaPlus,
FaEdit,
FaTrashAlt,
FaSearch,
FaTimes,
FaStar,
FaStarHalfAlt,
FaRegStar,
} from "react-icons/fa";


import toast from "react-hot-toast";

import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


function AdminProducts() {

const token =
localStorage.getItem("token");


const [products, setProducts] =
useState([]);

const [loading, setLoading] =
useState(true);

const [saving, setSaving] =
useState(false);

const [search, setSearch] =
useState("");

const [category, setCategory] =
useState("All");

const [activeDescription, setActiveDescription] = useState(null);

const [showModal, setShowModal] =
useState(false);

const [editId, setEditId] =
useState(null);

const [preview, setPreview] =
useState(null);

const [form, setForm] = useState({
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
});



  // =====================================
  // FETCH PRODUCTS
  // =====================================

const fetchProducts = async () => {

try {

setLoading(true);

const response =
await fetch(
          `${API_URL}/api/products`
        );

const data =
await response.json();


if (!response.ok) {
throw new Error(
data.message ||
          "Failed to load products"
        );
      }


setProducts(
Array.isArray(data.products)
          ? data.products
          : []
      );

    } catch (error) {

console.error(error);

toast.error(
        "Unable to load products"
      );

    } finally {

setLoading(false);

    }
  };


useEffect(() => {

fetchProducts();

  }, []);


  // =====================================
  // CATEGORIES
  // =====================================

const categories = useMemo(() => {

return [
      "All",

      ...new Set(
products
          .map(
            (product) =>
product.category
          )
          .filter(Boolean)
      ),
    ];

  }, [products]);


  // =====================================
  // FORM CHANGE
  // =====================================

const handleChange = (e) => {

const {
name,
value,
    } = e.target;


setForm((prev) => ({
      ...prev,
[name]: value,
    }));
  };


  // =====================================
  // OPEN ADD MODAL
  // =====================================

const openAddModal = () => {

setEditId(null);

setPreview(null);

setForm({
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
});

setShowModal(true);
  };


  // =====================================
  // IMAGE
  // =====================================

const handleImageChange = (e) => {

const file =
e.target.files?.[0];


if (!file) return;


setForm((prev) => ({
      ...prev,
image: file,
    }));


setPreview(
URL.createObjectURL(file)
    );
  };


  // =====================================
  // SUBMIT
  // =====================================

const handleSubmit = async (e) => {

e.preventDefault();


if (!form.name.trim()) {

toast.error(
        "Product name is required"
      );

return;
    }


if (!form.price) {

toast.error(
        "Product price is required"
      );

return;
    }


if (
form.old_price&&
Number(form.old_price)<=
Number(form.price)
    ) {

toast.error(
        "Old price must be greater than current price"
      );

return;
    }


try {

setSaving(true);


const formData =
new FormData();


formData.append(
        "name",
form.name
      );

formData.append(
        "description",
form.description
      );

formData.append(
        "price",
form.price
      );

formData.append(
        "old_price",
form.old_price
      );

formData.append(
        "category",
form.category
      );

formData.append(
        "stock",
form.stock || 0
      );

formData.append(
  "rating",
form.rating || 0
);

formData.append(
  "discount",
form.discount ? 1 : 0
);

formData.append(
  "featured",
form.featured ? 1 : 0
);

formData.append(
  "featured_category",
form.featured_category ? 1 : 0
);

formData.append(
  "hero",
form.hero ? 1 : 0
);


      // ---------------------------------
      // IMAGE
      // ---------------------------------

if (
form.image instanceof File
      ) {

formData.append(
          "image",
form.image
        );
      }


const url = editId

        ? `${API_URL}/api/products/${editId}`

        : `${API_URL}/api/products`;


const method = editId
        ? "PUT"
        : "POST";


const response =
await fetch(
url,
          {
method,

headers: {
Authorization:
                `Bearer ${token}`,
            },

body: formData,
          }
        );


const data =
await response.json();


if (!response.ok) {

throw new Error(
data.message ||
          "Something went wrong"
        );
      }


toast.success(
editId
          ? "Product updated successfully"
          : "Product added successfully"
      );


setShowModal(false);

setEditId(null);

setPreview(null);


await fetchProducts();


    } catch (error) {

console.error(error);

toast.error(
error.message ||
        "Something went wrong"
      );

    } finally {

setSaving(false);

    }
  };


  // =====================================
  // EDIT
  // =====================================

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
featured_category:
Number(product.featured_category) || 0,
hero: Number(product.hero) || 0,
});


setPreview(
product.image
        ? `${API_URL}/uploads/${product.image}`
        : null
    );


setShowModal(true);
  };


  // =====================================
  // DELETE
  // =====================================

const handleDelete = async (id) => {

const confirmed =
window.confirm(
        "Are you sure you want to delete this product?"
      );


if (!confirmed) return;


try {

const response =
await fetch(
          `${API_URL}/api/products/${id}`,

          {
method: "DELETE",

headers: {
Authorization:
                `Bearer ${token}`,
            },
          }
        );


const data =
await response.json();


if (!response.ok) {

throw new Error(
data.message ||
          "Delete failed"
        );
      }


toast.success(
        "Product deleted successfully"
      );


fetchProducts();


    } catch (error) {

console.error(error);

toast.error(
error.message ||
        "Delete failed"
      );
    }
  };


  // =====================================
  // FILTER
  // =====================================

const filteredProducts =
products.filter((product) => {

const matchesSearch =
String(
product.name || ""
        )
          .toLowerCase()
          .includes(
search.toLowerCase()
          );


const matchesCategory =
category === "All" ||
product.category === category;


return (
matchesSearch&&
matchesCategory
      );
    });


  // =====================================
  // DISCOUNT
  // =====================================

const getDiscountPercent =
    (old_price, price) => {

const oldValue =
Number(old_price);

const newValue =
Number(price);


if (
        !oldValue ||
        !newValue ||
oldValue <= newValue
      ) {
return 0;
      }


return Math.round(
        (
          (oldValue - newValue) /
oldValue
        ) * 100
      );
    };


//===============================================
//Rating
//===============================================

const renderRating = (rating) => {
const value = Number(rating) || 0;

return Array.from({ length: 5 }, (_, index) => {
const starNumber = index + 1;

if (value >= starNumber) {
return (
<FaStar
key={starNumber}
className="admin-rating-star filled"
        />
      );
    }

if (value >= starNumber - 0.5) {
return (
<FaStarHalfAlt
key={starNumber}
className="admin-rating-star half"
        />
      );
    }

return (
<FaRegStar
key={starNumber}
className="admin-rating-star empty"
      />
    );
  });
};



  // =====================================
  // STATS
  // =====================================

const totalProducts =
products.length;


const discountedProducts =
products.filter(
    (product) =>
Number(product.discount) === 1&&
getDiscountPercent(
product.old_price,
product.price
      ) > 0
  ).length;






const outOfStock =
products.filter(
      (product) =>
Number(product.stock) <= 0
    ).length;


  // =====================================
  // UI
  // =====================================

return (

<div className="admin-products">

<AdminSidebar />

<motion.main

className="admin-content"

initial={{
opacity: 0,
y: 25,
        }}

animate={{
opacity: 1,
y: 0,
        }}

transition={{
duration: 0.6,
        }}

>

        {/* HEADER */}

<div className="products-header">

<div>

<motion.h1

className="page-title"

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}
>

Products Management

</motion.h1>



<p className="page-subtitle">
Manage your premium products
professionally.
</p>

</div>


<button

className="add-product-btn"

onClick={
openAddModal
            }

>

<FaPlus />

Add Product

</button>

</div>


        {/* SEARCH */}

<div className="top-toolbar">

<div className="search-box">

<FaSearch />

<input

type="text"

placeholder="Search products..."

value={search}

onChange={(e) =>
setSearch(
e.target.value
                )
              }

            />


            {search&& (

<button

className="clear-btn"

onClick={() =>
setSearch("")
                }

>

<FaTimes />

</button>

            )}

</div>

</div>


        {/* STATS */}

<div className="stats-grid">

<div

className={
category === "All"
                ? "mini-card active"
                : "mini-card"
            }

onClick={() =>
setCategory("All")
            }

>

<h2>
              {totalProducts}
</h2>

<span>
Products
</span>

</div>


<div className="mini-card">

<h2>
              {discountedProducts}
</h2>

<span>
Discounted
</span>

</div>


<div className="mini-card">

<h2>
              {outOfStock}
</h2>

<span>
Out of Stock
</span>

</div>

</div>


        {/* CATEGORY FILTER */}

<div className="category-filter">

          {categories.map(
            (cat) => (

<button

key={cat}

className={
category === cat
                    ? "category-filter-btn active"
                    : "category-filter-btn"
                }

onClick={() =>
setCategory(cat)
                }

>

                {cat}

</button>

            )
          )}

</div>


        {/* PRODUCTS */}

        {loading ? (

<div className="admin-loading">
Loading products...
</div>

        ) : filteredProducts.length > 0 ? (

<div className="products-grid">

            {filteredProducts.map(
              (product) => {


const discount =
Number(product.discount) === 1
    ? getDiscountPercent(
product.old_price,
product.price
      )
    : 0;

return (

<motion.article

className="product-admin-card"

key={product.id}

whileHover={{
y: -8,
                    }}

>

<div className="image-box">

<img

src={
product.image

                            ? `${API_URL}/uploads/${product.image}`

                            : "/placeholder.png"
                        }

alt={
product.name
                        }

className="admin-food-image"

                      />


<span className="category-badge">

                        {product.category ||
                          "Product"}

</span>



                      {discount > 0&& (

<span className="discount-badge">

                          {discount}% OFF🔥

</span>

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
<span className="admin-hero-badge">
Hero
</span>
  )}

</div>



<div className="product-admin-top">


<h2>
                          {product.name}
</h2>

</div>


<div
className="description-tooltip-wrapper"
onClick={(e) => {
e.stopPropagation();

setActiveDescription(
activeDescription === product.id
        ? null
        : product.id
    );
  }}
>
<p className="product-description">
    {product.description || "Premium product"}
</p>

  {product.description&& (
<div
className={
activeDescription === product.id
          ? "description-tooltip show"
          : "description-tooltip"
      }
>
      {product.description}
</div>
  )}
</div>




<div className="admin-rating">
<div className="admin-rating-stars">
    {renderRating(product.rating)}
</div>

<span className="admin-rating-value">
    {Number(product.rating || 0).toFixed(1)}
</span>
</div>



<div className="price-box">

                        {discount > 0&& (

<span className="admin-old-price">

                            $
                            {Number(
product.old_price
                            ).toFixed(2)}

</span>

                        )}


<span className="admin-price">

                          $
                          {Number(
product.price
                          ).toFixed(2)}

</span>

</div>


<div

className={
Number(
product.stock
                          ) > 0

                            ? "stock-admin in"

                            : "stock-admin out"
                        }

>

<span />

                        {Number(
product.stock
                        ) > 0

                          ? `${product.stock} in stock`

                          : "Out of stock"}

</div>


<div className="buttons">

<button

className="edit-btn"

onClick={() =>
handleEdit(
product
                            )
                          }

>

<FaEdit />

Edit

</button>


<button

className="delete-btn"

onClick={() =>
handleDelete(
product.id
                            )
                          }

>

<FaTrashAlt />

Delete

</button>

</div>

</div>

</motion.article>

                );
              }
            )}

</div>

        ) : (

<div className="no-products">

<div className="no-products-icon">
🔍
</div>

<h2>
No Products Found
</h2>

<p>
Add your first premium product.
</p>

<button
onClick={
openAddModal
              }
>
Add Product
</button>

</div>

        )}


</motion.main>


      {/* =====================================
MODAL
      ===================================== */}

      {showModal&& (

<div

className="modal"

onClick={() =>
setShowModal(false)
          }

>

<div

className="modal-content"

onClick={(e) =>
e.stopPropagation()
            }

>

<div className="modal-header">

<div>

<span>
✨PREMIUM PRODUCT
</span>

<h2>

                  {editId
                    ? "Edit Product"
                    : "Add New Product"}

</h2>

</div>


<button

className="modal-close"

onClick={() =>
setShowModal(false)
                }

>

<FaTimes />

</button>

</div>


<form
onSubmit={handleSubmit}
>

<label>

Product Name

<input

name="name"

placeholder="e.g. Premium Product"

value={form.name}

onChange={
handleChange
                  }

                />

</label>


<label>

Category

<input

name="category"

placeholder="e.g. Electronics"

value={
form.category
                  }

onChange={
handleChange
                  }

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

value={
form.price
                  }

onChange={
handleChange
                  }

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

<div className="switch-row">

<label>
Discount
</label>

<label className="switch">

<input
type="checkbox"
checked={form.discount === 1}
onChange={(e) =>
setForm((prev) => ({
          ...prev,
discount: e.target.checked ? 1 : 0,
        }))
      }
    />

<span></span>

</label>

</div>

<div className="switch-row">

<label>
Featured Product
</label>

<label className="switch">

<input
type="checkbox"
checked={form.featured === 1}
onChange={(e) =>
setForm((prev) => ({
  ...prev,
featured: e.target.checked ? 1 : 0
}))
}
/>

<span></span>

</label>

</div>


<div className="switch-row">

<label>
Featured Category
</label>

<label className="switch">

<input
type="checkbox"
checked={form.featured_category === 1}
onChange={(e) =>
setForm((prev) => ({
          ...prev,
featured_category: e.target.checked ? 1 : 0,
        }))
      }
    />

<span></span>

</label>

</div>


<div className="switch-row">

<label>
Hero Product
</label>

<label className="switch">

<input
type="checkbox"
checked={form.hero === 1}
onChange={(e) =>
setForm((prev) => ({
  ...prev,
hero: e.target.checked ? 1 : 0
}))
}
/>

<span></span>

</label>

</div>

<label>

Stock

<input

type="number"

min="0"

name="stock"

placeholder="0"

value={
form.stock
                  }

onChange={
handleChange
                  }

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



<label className="full-field">

Description

<textarea

name="description"

placeholder="Product description..."

value={
form.description
                  }

onChange={
handleChange
                  }

                />

</label>


              {/* IMAGE UPLOAD */}

<label className="upload-image">

<span>
Choose Product Image
</span>

<input

type="file"

accept="image/jpeg,image/png,image/webp"

onChange={
handleImageChange
                  }

                />

</label>


              {/* IMAGE PREVIEW */}

              {preview&& (

<div className="preview-box">

<img

src={preview}

alt="Preview"

className="preview-image"

                  />

</div>

              )}


<div className="discount-info">

                {form.old_price&&
form.price&&
Number(form.old_price)>
Number(form.price)

                  ? `🔥Discount: ${getDiscountPercent(
form.old_price,
form.price
                    )}%`

                  : "No discount"}

</div>


<div className="modal-buttons">

<button

type="submit"

className="save-btn"

disabled={saving}

>

                  {saving

                    ? "Saving..."

                    : editId
                      ? "Update Product"
                      : "Add Product"}

</button>


<button

type="button"

className="cancel-btn"

onClick={() =>
setShowModal(false)
                  }

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

