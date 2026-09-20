import "./FeaturedProducts.css";

import "../../pages/Products/Products.css";

import { motion } from "framer-motion";

import {
useEffect,
useRef,
useState,
} from "react";

import { useNavigate } from "react-router-dom";

import StarRating from "../StarRating/StarRating";

import toast from "react-hot-toast";

import { useCart } from "../../context/CartContext";

import { useWishlist } from "../../context/WishlistContext";

import {
FaHeart,
} from "react-icons/fa";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


function FeaturedProducts({ setFlyItem }) {

const navigate = useNavigate();

const {
cartItems,
setCartItems,
  } = useCart();


const {
toggleWishlist,
isFavorite,
} = useWishlist();



const [products, setProducts] =
useState([]);

const [activeDescription, setActiveDescription] =
useState(null);

const productRefs =
useRef({});


  // =====================================
  // IMAGE URL
  // =====================================

const getImageUrl = (product) => {

if (!product?.image) {
return "/placeholder.png";
    }

if (
product.image.startsWith("http")
    ) {
return product.image;
    }

return `${API_URL}/uploads/${product.image}`;
  };


  // =====================================
  // FETCH PRODUCTS
  // =====================================

useEffect(() => {

const fetchProducts = async () => {

try {

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

console.error(
          "Featured products error:",
error
        );

      } 

    };


fetchProducts();

  }, []);


  // =====================================
  // FEATURED PRODUCTS
  // =====================================

const featuredProducts =
products
      .filter(
        (product) =>
Number(product.featured) === 1
      )
      .slice(0, 8);


  // =====================================
  // DISCOUNT
  // =====================================

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


  // =====================================
  // ADD TO CART
  // =====================================

const addToCart = (
product,
event
) => {

event.stopPropagation();


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
item.id === product.id
    );


const currentQuantity =
Number(
existingItem?.quantity || 0
    );


if (
currentQuantity >= stock
  ) {

toast.error(
      "You reached the available stock"
    );

return;
  }


  // =================================
  // FLY IMAGE
  // =================================

const card =
productRefs.current[product.id];

const productImage =
card?.querySelector(
      ".product-image img"
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

setCartItems((prev) => {

const exists =
prev.find(
        (item) =>
item.id === product.id
      );


if (exists) {

return prev.map(
        (item) =>
item.id === product.id
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


toast.success(
    `${product.name} added to cart`
  );

};


return (

<>

<section className="featured-products-section">


        {/* =================================
HEADER
        ================================= */}

<div className="featured-products-header">

<div>

<span className="featured-products-label">
BEST PICKS FOR YOU
</span>


<h2 className="featured-products-title">
Featured Products
</h2>


<p className="featured-products-subtitle">
Discover our most popular products,
carefully selected for you.
</p>

</div>


<button

className="featured-products-view-all"

onClick={() =>
navigate("/products")
            }

>
View All →
</button>

</div>


        {/* =================================
PRODUCTS
        ================================= */}

<div className="featured-products-grid">


          {featuredProducts.map(
            (product, index) => {


const discount =
Number(product.discount) === 1
                  ? getDiscountPercent(
product.old_price,
product.price
                    )
                  : 0;


const stock =
Number(product.stock) || 0;


const cartQuantity =
Number(
cartItems.find(
                    (item) =>
item.id === product.id
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
delay: index * 0.06,
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


    {/* OUT OF STOCK */}

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

</div>


    {/* ADD TO CART */}

    {!isOutOfStock&& (

<button

className="add-cart"

onClick={(event) => {

event.stopPropagation();

addToCart(
product,
event
          );

        }}

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


        {/* =================================
EMPTY
        ================================= */}

        {featuredProducts.length === 0&& (

<div className="featured-products-empty">

No featured products available.

</div>

        )}

</section>


</>

  );

}


export default FeaturedProducts;


