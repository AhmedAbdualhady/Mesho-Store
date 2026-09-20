import "./Wishlist.css";

import {
useEffect,
useMemo,
useRef,
useState,
} from "react";

import {
FaHeart,
FaSearch,
} from "react-icons/fa";

import {
motion,
} from "framer-motion";

import toast from "react-hot-toast";

import StarRating from "../../components/StarRating/StarRating";

import {
useWishlist,
} from "../../context/WishlistContext";

import {
useCart,
} from "../../context/CartContext";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";



function Wishlist({ setFlyItem }) {

// =========================================
// SCROLL TO TOP
// =========================================

useEffect(()=>{

window.scrollTo({
top:0,
behavior:"auto"
});

},[]);


  // =========================================
  // CONTEXT
  // =========================================

const {
wishlistItems,
toggleWishlist,
isFavorite,
  } = useWishlist();


const {
cartItems,
setCartItems,
  } = useCart();


  // =========================================
  // STATE
  // =========================================

const [products, setProducts] =
useState([]);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState("");

const [search, setSearch] =
useState("");

const [category, setCategory] =
useState("All");


const [activeDescription, setActiveDescription] =
useState(null);

const productRefs = useRef({});



  // =========================================
  // FETCH PRODUCTS
  // =========================================

useEffect(() => {

const fetchProducts =
async () => {

try {

setLoading(true);

setError("");


const response =
await fetch(
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

Array.isArray(
data.products
            )

              ? data.products

              : []

          );


        } catch (err) {

console.error(
            "Wishlist API Error:",
err
          );


setError(
            "Unable to load wishlist products."
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

const getImageUrl =
    (product) => {

if (!product?.image) {

return "/placeholder.png";

      }


if (
product.image.startsWith(
          "http"
        )
      ) {

return product.image;

      }


return `${API_URL}/uploads/${product.image}`;

    };


  // =========================================
  // DISCOUNT
  // =========================================

const getDiscountPercent =
    (
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

const categories =
useMemo(() => {

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
  // WISHLIST PRODUCTS
  // =========================================

const wishlistProducts =
useMemo(() => {

return products.filter(
product =>
wishlistItems.includes(
Number(product.id)
          )
      );

    }, [
products,
wishlistItems,
    ]);


  // =========================================
  // FILTER
  // =========================================

const filteredWishlist =
useMemo(() => {

const searchValue =
search
          .toLowerCase()
          .trim();


return wishlistProducts.filter(
product => {

const productName =
String(
product.name || ""
            ).toLowerCase();


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

        }
      );

    }, [
wishlistProducts,
search,
category,
    ]);


  // =========================================
  // ADD TO CART
  // =========================================

const addToCart = (product) => {

  // =================================
  // STOCK
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
item =>
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

const card =
productRefs.current[product.id];

const productImage =
card?.querySelector(
      ".wishlist-card-image img"
    );


if (productImage) {

const rect =
productImage.getBoundingClientRect();


setFlyItem({
image: getImageUrl(product),
rect,
    });

  }


  // =================================
  // CART UPDATE
  // =================================

setCartItems(prev => {

const exists =
prev.find(
item =>
Number(item.id) ===
Number(product.id)
      );


if (exists) {

return prev.map(item => {

if (
Number(item.id) !==
Number(product.id)
        ) {

return item;

        }


return {

          ...item,

quantity:
Number(
item.quantity || 0
            ) + 1,

        };

      });

    }


return [

      ...prev,

      {

        ...product,

quantity: 1,

      },

    ];

  });


toast.success(
    `${product.name} added to cart`
  );

};


  // =========================================
  // REMOVE WISHLIST
  // =========================================

const removeFromWishlist =
    (product) => {

toggleWishlist(product);

toast.success(
        "Removed from wishlist"
      );

    };


  // =========================================
  // LOADING
  // =========================================


if (loading &&wishlistItems.length> 0) {

return (

<motion.main

className="wishlist-page"

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


<section className="wishlist-hero">

<span className="wishlist-label">
YOUR FAVORITES
</span>

<h1>
My Wishlist
<FaHeart className="wishlist-heart"/>
</h1>

<p>
Products you saved for later.
</p>

</section>


<div className="wishlist-loading">

        {Array.from({
length: 4,
        }).map((_, index) => (

<div
className="wishlist-skeleton"
key={index}
>

<div className="wishlist-skeleton-image" />

<div className="wishlist-skeleton-line large" />

<div className="wishlist-skeleton-line" />

<div className="wishlist-skeleton-line small" />

</div>

        ))}

</div>

</motion.main>

  );

}


  // =========================================
  // ERROR
  // =========================================

if (error) {

return (

<motion.main

className="wishlist-page"


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

<section className="wishlist-error">

<div className="wishlist-error-icon">
<FaHeart className="wishlist-heart"/>
</div>

<h2>
Something went wrong
</h2>

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

</section>

</motion.main>



    );

  }


  // =========================================
  // RENDER
  // =========================================

return (

<motion.main

className="wishlist-page"

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

{wishlistProducts.length> 0&& (

<section className="wishlist-hero">

<motion.div

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}
>

<span className="wishlist-label">
YOUR FAVORITES
</span>

<h1>
My Wishlist
<span> <FaHeart className="wishlist-heart"/></span>
</h1>

<p>
Keep your favorite products
close and shop them whenever
you're ready.
</p>

</motion.div>

</section>

)}


      {/* =====================================
TOOLBAR
      ===================================== */}

      {wishlistProducts.length > 0&& (

<section className="wishlist-toolbar">


          {/* SEARCH */}

<div className="wishlist-search">

<FaSearch />

<input

type="text"

placeholder="Search your favorites..."

value={search}

onChange={(e) =>
setSearch(
e.target.value
                )
              }

            />


            {search&& (

<button

className="wishlist-clear"

onClick={() =>
setSearch("")
                }

>
                ×
</button>

            )}

</div>


          {/* CATEGORY */}

<div className="wishlist-categories">

            {categories.map(cat => (

<button

key={cat}

className={
category === cat
                    ? "wishlist-category active"
                    : "wishlist-category"
                }

onClick={() =>
setCategory(cat)
                }

>

                {cat}

</button>

            ))}

</div>

</section>

      )}


      {/* =====================================
PRODUCTS
      ===================================== */}

      {filteredWishlist.length > 0 ? (

<div className="wishlist-grid">

          {filteredWishlist.map(
            (product, index) => {


              // =================================
              // DISCOUNT
              // =================================

const discount =
Number(product.discount) === 1

                  ? getDiscountPercent(
product.old_price,
product.price
                    )

                  : 0;


              // =================================
              // STOCK
              // =================================

const stock =
Number(product.stock) || 0;


const cartQuantity =
Number(

cartItems.find(
item =>
Number(item.id) ===
Number(product.id)
                  )?.quantity || 0

                );


const availableStock =
Math.max(
                  0,
stock - cartQuantity
                );


const isOutOfStock =
availableStock <= 0;


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
                      ? "wishlist-card out-of-stock-card"
                      : "wishlist-card"
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

<div className="wishlist-card-image">


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


                    {/* OUT OF STOCK */}

                    {isOutOfStock&& (

<div className="wishlist-out-stock-overlay">

<span>
OUT OF STOCK
</span>

</div>

                    )}


                    {/* CATEGORY */}

<span className="wishlist-card-category">

                      {product.category ||
                        "Product"}

</span>


                    {/* DISCOUNT */}

                    {discount > 0&&
                      !isOutOfStock&& (

<span className="wishlist-card-discount">

                        {discount}% OFF🔥

</span>

                    )}


                    {/* REMOVE */}

<button

className={
isFavorite(
product.id
                        )
                          ? "wishlist-remove active"
                          : "wishlist-remove"
                      }

onClick={() =>
removeFromWishlist(
product
                        )
                      }

aria-label="Remove from wishlist"

>

<FaHeart />

</button>

</div>


                  {/* =================================
INFO
                  ================================= */}


<div className="wishlist-card-info">

<div className="wishlist-card-details">

<h2 className="wishlist-product-name">

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
    {product.description ||
      "Premium product"}
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

<div className="wishlist-product-rating">

<StarRating

rating={
Number(
product.rating
                            ) || 0
                          }

                        />

</div>


                      {/* PRICE */}

<div className="wishlist-price-box">

                        {discount > 0&& (

<span className="wishlist-old-price">

                            $
                            {Number(
product.old_price
                            ).toFixed(2)}

</span>

                        )}


<span className="wishlist-new-price">

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
                            ? "wishlist-stock-status wishlist-out-stock"
                            : "wishlist-stock-status wishlist-in-stock"
                        }

>

<span className="wishlist-stock-dot" />


                        {isOutOfStock

                          ? "Out of Stock"

                          : `${availableStock} in stock`

                        }

</span>

</div>


                    {/* ADD TO CART */}

                    {!isOutOfStock&& (

<button

className="wishlist-add-cart"

onClick={() =>
addToCart(
product
                          )
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

<section className="wishlist-empty">


<motion.div

className="wishlist-empty-icon"

initial={{
opacity: 0,
y: 40,
            }}

animate={{
opacity: 1,
y: 0,
            }}

transition={{
duration: 0.5,
            }}

>

<FaHeart className="wishlist-heart"/>

</motion.div> 


<motion.h2

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}
>




            {wishlistProducts.length === 0

              ? "Your Wishlist Is Empty"

              : "No Products Found"

            }

</motion.h2>

<motion.p

initial={{
opacity: 0,
y: 40,
            }}

animate={{
opacity: 1,
y: 0,
            }}

transition={{
duration: 0.5,
            }}

> 

            {wishlistProducts.length === 0

              ? "Start adding products you love to your favorites."

              : "Try another search or category."

            }

</motion.p> 



          {wishlistProducts.length > 0&& (

<motion.button

className="wishlist-all-favorites"

onClick={() => {

setSearch("");

setCategory("All");

              }}


initial={{
opacity: 0,
y: 40,
            }}

animate={{
opacity: 1,
y: 0,
            }}

transition={{
duration: 0.5,
            }}



>

Show All Favorites

</motion.button>

          )}

</section>

      )}


</motion.main>


  );

}


export default Wishlist;
