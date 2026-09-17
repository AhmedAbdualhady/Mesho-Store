import "./Products.css";
import StarRating from "../../components/StarRating/StarRating";

import { motion } from "framer-motion";

import {
FaHeart,
FaSearch,
} from "react-icons/fa";

import {
useEffect,
useMemo,
useRef,
useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";


// =========================================
// LOCAL API
// =========================================

const API_URL = "http://localhost:5000";


// =========================================
// COMPONENT
// =========================================



function Products({ setFlyItem }) {

const [searchParams] = useSearchParams();

const categoryFromURL =
searchParams.get("category") || "All";


const {
cartItems,
setCartItems,
} = useCart();

const {
toggleWishlist,
isFavorite,
  } = useWishlist();

const productRefs = useRef({});


  // =========================================
  // STATE
  // =========================================

const [products, setProducts] = useState([]);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

const [search, setSearch] = useState("");

const [category, setCategory] =
useState(categoryFromURL);

const [activeDescription, setActiveDescription] = useState(null);


useEffect(() => {

const urlCategory =
searchParams.get("category") || "All";

setCategory(urlCategory);

}, [searchParams]);


const [sort, setSort] = useState("default");

const [currentPage, setCurrentPage] = useState(1);


const productsPerPage = 8;


  // =========================================
  // FETCH PRODUCTS
  // =========================================

useEffect(() => {

window.scrollTo({
top: 0,
behavior: "auto",
    });


const fetchProducts = async () => {

try {

setLoading(true);

setError("");


const response = await fetch(
          `${API_URL}/api/products`
        );


if (!response.ok) {
throw new Error(
            "Failed to fetch products"
          );
        }


const data =
await response.json();


setProducts(
Array.isArray(data.products)
            ? data.products
            : []
        );


      } catch (err) {

console.error(
          "Products API Error:",
err
        );


setError(
          "Unable to load products. Make sure the server is running."
        );


      } finally {

setLoading(false);

      }

    };


fetchProducts();

  }, []);


  // =========================================
  // IMAGE URL
  // =========================================

const getImageUrl = (product) => {

if (!product?.image) {
return "";
    }


if (
product.image.startsWith("http")
    ) {
return product.image;
    }


return `${API_URL}/uploads/${product.image}`;

  };


  // =========================================
  // DISCOUNT
  // =========================================

const getDiscountPercent = (
oldPrice,
price
  ) => {

const oldValue =
Number(oldPrice);

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


  // =========================================
  // CATEGORIES
  // =========================================

const categories = useMemo(() => {

return [
      "All",

      ...new Set(
products
          .map(
product =>
product.category
          )
          .filter(Boolean)
      ),

    ];

  }, [products]);


  // =========================================
  // FILTER + SORT
  // =========================================

const filteredProducts =
useMemo(() => {

let result =
products.filter(product => {

const productName =
String(
product.name || ""
            ).toLowerCase();


const searchValue =
search
              .toLowerCase()
              .trim();


const matchesSearch =
productName.includes(
searchValue
            );


const matchesCategory =
category === "All" ||
product.category === category;


return (
matchesSearch&&
matchesCategory
          );

        });


// =========================================
// SORT
// =========================================

if (sort === "default") {
result.sort(
    (a, b) =>
Number(b.featured) -
Number(a.featured)
  );
}

if (sort === "low") {
result.sort(
    (a, b) =>
Number(a.price) -
Number(b.price)
  );
}

if (sort === "high") {
result.sort(
    (a, b) =>
Number(b.price) -
Number(a.price)
  );
}

if (sort === "name") {
result.sort(
    (a, b) =>
String(a.name).localeCompare(
String(b.name)
      )
  );
}

if (sort === "discount") {
result.sort(
    (a, b) =>
      (
Number(b.discount) === 1
          ? getDiscountPercent(
b.old_price,
b.price
            )
          : 0
      ) -
      (
Number(a.discount) === 1
          ? getDiscountPercent(
a.old_price,
a.price
            )
          : 0
      )
  );
}


return result;

    }, [
products,
search,
category,
sort,
    ]);


  // =========================================
  // PAGINATION
  // =========================================

const totalPages =
Math.ceil(
filteredProducts.length /
productsPerPage
    );


const safePage =
totalPages === 0
      ? 1
      : Math.min(
currentPage,
totalPages
        );


const indexOfLast =
safePage *
productsPerPage;


const indexOfFirst =
indexOfLast -
productsPerPage;


const currentProducts =
filteredProducts.slice(
indexOfFirst,
indexOfLast
    );


  // =========================================
  // RESET PAGE
  // =========================================

useEffect(() => {

setCurrentPage(1);

  }, [
search,
category,
sort,
  ]);



// =========================================
// ADD TO CART
// =========================================

const addToCart = (product, event) => {

event.stopPropagation();


  // =================================
  // STOCK CHECK FIRST
  // =================================

const stock =
Number(product.stock) || 0;


if (stock <= 0) {

toast.error(
      "This product is out of stock"
    );

return;
  }


const existingItem =
cartItems.find(
      (item) =>
Number(item.id) ===
Number(product.id)
    );


const currentQuantity =
Number(
existingItem?.quantity || 0
    );


if (currentQuantity>= stock) {

toast.error(
      "You reached the available stock"
    );

return;
  }


  // =================================
  // FLY TO CART
  // =================================

const button =
event.currentTarget;


const productCard =
button.closest(
      ".product-card"
    );


const productImage =
productCard?.querySelector(
      ".product-image img"
    );


if (productImage) {

const rect =
productImage.getBoundingClientRect();


setFlyItem({

image:
getImageUrl(product),

rect,

    });

  }


  // =================================
  // UPDATE CART
  // =================================

setCartItems((prev) => {

const exists =
prev.find(
        (item) =>
Number(item.id) ===
Number(product.id)
      );


if (exists) {

return prev.map(
        (item) =>

Number(item.id) ===
Number(product.id)

            ? {

                ...item,

quantity:
Number(
item.quantity || 0
                  ) + 1,

              }

            : item
      );

    }


return [

      ...prev,

      {

        ...product,

quantity: 1,

      },

    ];

  });


  // =================================
  // SUCCESS
  // =================================

toast.success(
    `${product.name} added to cart`
  );

};

  // =========================================
  // CLEAR SEARCH
  // =========================================

const clearSearch = () => {

setSearch("");

  };


  // =========================================
  // RENDER
  // =========================================

return (

<>


<motion.main 

className="products-page"

initial={{
opacity:0,
x:60
}}

animate={{
opacity:1,
x:0
}}

exit={{
opacity:0,
x:-60
}}

transition={{
duration:.45
}}

>


        {/* =====================================
HERO
        ===================================== */}

<section className="products-hero">

<div>

<span className="hero-label">
OUR COLLECTION
</span>


<motion.h1
initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}
>

Discover Something

<span> Special</span>

</motion.h1>


<p>
Explore our carefully selected
products and find your favorites.
</p>

</div>

</section>


        {/* =====================================
TOOLBAR
        ===================================== */}

<section className="products-toolbar">


          {/* SEARCH */}

<div className="products-search">

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

className="clear-search"

onClick={clearSearch}

>

                ×

</button>

            )}

</div>


          {/* CATEGORY */}

<div className="category-buttons">

            {categories.map(cat => (

<button

key={cat}

className={
category === cat
                    ? "category-btn active"
                    : "category-btn"
                }

onClick={() =>
setCategory(cat)
                }

>

                {cat}

</button>

            ))}

</div>


          {/* SORT */}

<div className="sort-wrapper">

<span>
Sort:
</span>


<select

value={sort}

onChange={(e) =>
setSort(
e.target.value
                )
              }

>

<option value="default">
Featured
</option>

<option value="low">
Price: Low → High
</option>

<option value="high">
Price: High → Low
</option>

<option value="name">
Name: A → Z
</option>

<option value="discount">
Biggest Discount
</option>

</select>

</div>


</section>


        {/* =====================================
ERROR
        ===================================== */}

        {error&& (

<div className="products-error">

<p>
              {error}
</p>


<button
onClick={() =>
window.location.reload()
              }
>
Try Again
</button>

</div>

        )}


        {/* =====================================
LOADING
        ===================================== */}

        {loading ? (

<div className="products-loading">

            {Array.from({
length: 8,
            }).map((_, index) => (

<div
className="skeleton-card"
key={index}
>

<div className="skeleton-image" />

<div className="skeleton-line large" />

<div className="skeleton-line" />

<div className="skeleton-line small" />

</div>

            ))}

</div>

        ) : (

<>

            {/* =====================================
PRODUCTS
            ===================================== */}

            {currentProducts.length > 0 ? (

<div className="products-card-grid">

                {currentProducts.map(
                  (product, index) => {


const discount =
Number(product.discount) === 1
    ? getDiscountPercent(
product.old_price,
product.price
      )
    : 0;

const stock = Number(product.stock) || 0;

const cartQuantity =
Number(
cartItems.find(
item =>item.id === product.id
  )?.quantity || 0
);

const availableStock =
Math.max(
  0,
stock - cartQuantity
);

const isOutOfStock =
availableStock<= 0;



return (

<motion.article

key={product.id}

ref={(element) => {

productRefs.current[
product.id
                          ] = element;

                        }}

className={
isOutOfStock
                            ? "product-card out-of-stock-card"
                            : "product-card"
                        }

initial={{
opacity: 0,
y: 45,
                        }}

whileInView={{
opacity: 1,
y: 0,
                        }}

viewport={{
once: true,
amount: 0.15,
                        }}

transition={{
duration: 0.5,
delay:
index * 0.06,
                        }}

whileHover={
isOutOfStock
                            ? {
y: -3,
                              }
                            : {
y: -8,
                              }
                        }

>


                        {/* =================================
IMAGE
                        ================================= */}

<div className="product-image">


<img

src={
getImageUrl(
product
                              )
                            }

alt={
product.name
                            }

                          />


                          {/* OUT OF STOCK OVERLAY */}

                          {isOutOfStock&& (

<div className="out-stock-overlay">

<span>
OUT OF STOCK
</span>

</div>

                          )}


                          {/* CATEGORY */}

<span className="card-category">

                            {product.category ||
                              "Product"}

</span>


                          {/* DISCOUNT */}

                          {discount > 0&&
                            !isOutOfStock&& (

<span className="card-discount">

                                {discount}% OFF🔥


</span>

                          )}


                          {/* WISHLIST */}

<button

className={
isFavorite(
product.id
                              )
                                ? "wishlist-product-btn active"
                                : "wishlist-product-btn"
                            }

onClick={(e) => {

e.stopPropagation();

toggleWishlist(
product
                              );

                            }}

aria-label="Add to wishlist"

>

<motion.div

animate={

isFavorite(
product.id
                                )

                                  ? {
scale:
                                        [1, 1.3, 1],
                                    }

                                  : {
scale: 1,
                                    }

                              }

transition={{
duration: 0.3,
                              }}

>

<FaHeart />

</motion.div>

</button>


</div>


                        {/* =================================
CARD INFO
                        ================================= */}

<div className="product-info">


<div className="product-main-row">


<div className="product-details">


<h2 className="product-name">
  {product.name}
</h2>


{/* DESCRIPTION */}


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

{/* RATING */}

<div className="product-rating">

<StarRating
rating={
Number(
product.rating
                                    ) || 0
                                  }
                                />

</div>


                              {/* PRICE */}

<div className="price-box">

                                {discount > 0&& (

<span className="old-price">

                                    $
                                    {Number(
product.old_price
                                    ).toFixed(2)}

</span>

                                )}


<span className="new-price">

                                  $
                                  {Number(
product.price
                                  ).toFixed(2)}

</span>

</div>


                              {/* STOCK */}

<span

className={
isOutOfStock
                                    ? "stock-status out-stock"
                                    : "stock-status in-stock"
                                }

>

<span className="stock-dot" />


{isOutOfStock
  ? "Out of Stock"
  : `${availableStock} in stock`
}


</span>


</div>


                            {/* RIGHT SIDE */}




</div>


                          {/* ADD TO CART */}


{!isOutOfStock&& (

<button

className="add-cart"

onClick={(event) =>
addToCart(product, event)
}

>
Add to Cart
</button>

)}


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
Try another search or category.
</p>


<button

onClick={() => {

setSearch("");

setCategory("All");

                  }}

>
Show All Products
</button>

</div>

            )}


            {/* =====================================
PAGINATION
            ===================================== */}

            {totalPages > 1&& (

<div className="pagination">


<button

className="pagination-arrow"

disabled={
safePage === 1
                  }

onClick={() =>
setCurrentPage(
prev =>
Math.max(
                          1,
prev - 1
                        )
                    )
                  }

>
                  ← Prev
</button>


                {Array.from(
                  {
length:
totalPages,
                  },

                  (_, index) => {

const page =
index + 1;


return (

<button

key={page}

className={
safePage === page
                            ? "page-number active"
                            : "page-number"
                        }

onClick={() =>
setCurrentPage(
page
                          )
                        }

>

                        {page}

</button>

                    );

                  }

                )}


<button

className="pagination-arrow"

disabled={
safePage ===
totalPages
                  }

onClick={() =>
setCurrentPage(
prev =>
Math.min(
totalPages,
prev + 1
                        )
                    )
                  }

>
Next →
</button>


</div>

            )}

</>

        )}

</motion.main>

</>

  );

}


export default Products;
