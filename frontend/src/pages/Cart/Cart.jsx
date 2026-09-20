import "./Cart.css";

import { useCart } from "../../context/CartContext";

import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {
FaTrashAlt,
FaShoppingBag,
FaMinus,
FaPlus,
} from "react-icons/fa";



// =====================================================
// API
// =====================================================

const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";



// =====================================================
// COMPONENT
// =====================================================

function Cart({ setFlyItem }) {

const navigate = useNavigate();

const {
cartItems,
setCartItems,
  } = useCart();


  // ===================================================
  // IMAGE URL
  // ===================================================

const getImageUrl = (product) => {

if (!product?.image) {
return "";
    }


    // لوالصورةURLكامل
if (
product.image.startsWith("http")
    ) {
return product.image;
    }


    // لواسمالصورةفقط
return `${API_URL}/uploads/${product.image}`;

  };


  // ===================================================
  // INCREASE
  // ===================================================



// ===================================================
// INCREASE
// ===================================================

const increase = (id, event) => {

  // =========================================
  // FIND PRODUCT
  // =========================================

const product =
cartItems.find(
      (item) =>
Number(item.id) === Number(id)
    );


if (!product) {
return;
  }


  // =========================================
  // STOCK CHECK
  // =========================================

const currentQuantity =
Number(product.quantity) || 1;

const availableStock =
Number(product.stock) || 0;


if (
currentQuantity>=
availableStock
  ) {

return;
  }


  // =========================================
  // FLY TO CART
  // =========================================

const button =
event.currentTarget;


const card =
button.closest(
      ".cart-card"
    );


const productImage =
card?.querySelector(
      ".cart-image-wrapper img"
    );


if (productImage) {

const rect =
productImage.getBoundingClientRect();


setFlyItem({
image: getImageUrl(product),
rect,
    });

  }


  // =========================================
  // UPDATE QUANTITY
  // =========================================

setCartItems((prev) => {

return prev.map((item) => {

if (
Number(item.id) !==
Number(id)
      ) {

return item;

      }


const quantity =
Number(item.quantity) || 1;


return {

        ...item,

quantity:
quantity + 1,

      };

    });

  });

};



  // ===================================================
  // DECREASE
  // ===================================================

const decrease = (id) => {

setCartItems((prev) => {

return prev.map((item) => {

if (item.id !== id) {
return item;
        }


const currentQuantity =
Number(item.quantity) || 1;


return {

          ...item,

quantity:
Math.max(
              1,
currentQuantity - 1
            ),

        };

      });

    });

  };


  // ===================================================
  // REMOVE
  // ===================================================

const removeItem = (id) => {

setCartItems((prev) =>
prev.filter(
        (item) =>
item.id !== id
      )
    );

  };


  // ===================================================
  // SUBTOTAL
  // ===================================================

const subtotal =
cartItems.reduce(
      (sum, item) => {

const price =
Number(item.price) || 0;

const quantity =
Number(item.quantity) || 0;


return (
sum +
price * quantity
        );

      },
      0
    );


  // ===================================================
  // SHIPPING
  // ===================================================

  
const shipping = 0;



  // ===================================================
  // TOTAL
  // ===================================================

const total =
subtotal + shipping;


  // ===================================================
  // RENDER
  // ===================================================

return (

<>


<motion.main 

className="cart-page"

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



        {/* =================================================
EMPTY CART
        ================================================= */}

        {cartItems.length === 0 ? (

<motion.div

className="empty-cart"

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

<div className="empty-icon">
🛒
</div>



<motion.h2
initial={{
opacity: 0,
y: 25,
  }}
animate={{
opacity: 1,
y: 0,
  }}
transition={{
delay: 0.15,
duration: 0.5,
ease: "easeOut",
  }}
>
Your Cart Is Empty
</motion.h2>


<p>
Looks like you haven't
added anything yet.
</p>


<button

className="continue-btn"

onClick={() =>
navigate("/products")
              }

>

Continue Shopping

</button>

</motion.div>

        ) : (

<>

            {/* =================================================
TITLE
            ================================================= */}

<motion.h1

className="cart-title"

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}
>

Shopping Cart

</motion.h1>


<div className="cart-layout">


              {/* =================================================
PRODUCTS
              ================================================= */}

<div className="cart-products">

<AnimatePresence>

                  {cartItems.map(
                    (product) => {

const quantity =
Number(
product.quantity
                        ) || 1;

const stock =
Number(product.stock) || 0;

const price =
Number(product.price) || 0;

// المتبقيالحقيقيفيالمخزونبعدالكميةالموجودةفيالسلة


const availableStock =
Math.max(0, stock - quantity);

const isMaxStock =
quantity >= stock;

const isOutOfStock =
availableStock<= 0;



return (

<motion.div

layout

key={
product.id
                          }

className={
isOutOfStock
                              ? "cart-card cart-card-out"
                              : "cart-card"
                          }

initial={{
opacity: 0,
x: 50,
                          }}

animate={{
opacity: 1,
x: 0,
                          }}

exit={{
opacity: 0,
x: -50,
                          }}

transition={{
duration: 0.35,
                          }}

>


                          {/* =================================================
IMAGE
                          ================================================= */}

<div className="cart-image-wrapper">

<img

src={
getImageUrl(
product
                                )
                              }

alt={
product.name
                              }

onError={(e) => {

e.currentTarget.style.display =
                                  "none";

                              }}

                            />


                            {isOutOfStock&& (

<span className="cart-out-badge">

OUT OF STOCK

</span>

                            )}

</div>


                          {/* =================================================
INFO
                          ================================================= */}

<div className="cart-info">

<h3>
                              {product.name}
</h3>


<p className="category">

                              {product.category ||
                                "Product"}

</p>


<div className="price">

                              $
                              {price.toFixed(2)}

</div>

<div
className={
isOutOfStock
      ? "cart-stock out"
      : "cart-stock"
  }
>

<span />

  {isOutOfStock
    ? "Out of Stock"
    : `${availableStock} available`
  }

</div>

</div>


                          {/* =================================================
QUANTITY
                          ================================================= */}

<div className="quantity-section">

<span className="quantity-label">
Quantity
</span>


<div className="quantity-box">


                              {/* MINUS */}

<button

className="quantity-btn"

onClick={() =>
decrease(
product.id
                                  )
                                }

disabled={
quantity <= 1
                                }

aria-label="Decrease quantity"

>

<FaMinus />

</button>


                              {/* NUMBER */}

<span className="quantity-number">

                                {quantity}

</span>


                              {/* PLUS */}

<button

className="quantity-btn plus"

onClick={(event) =>
increase(
product.id,
event
  )
}

disabled={
isOutOfStock ||
isMaxStock
                                }

aria-label="Increase quantity"

>

<FaPlus />

</button>

</div>


                            {isMaxStock&&
                              !isOutOfStock&& (

<small className="max-stock-text">

Maximum available

</small>

                            )}

</div>


                          {/* =================================================
ITEM TOTAL
                          ================================================= */}

<div className="item-total">

                            $
                            {(
price *
quantity
                            ).toFixed(2)}

</div>


                          {/* =================================================
REMOVE
                          ================================================= */}

<button

className="remove-btn"

onClick={() =>
removeItem(
product.id
                              )
                            }

aria-label="Remove item"

>

<FaTrashAlt />

</button>


</motion.div>

                      );

                    }
                  )}

</AnimatePresence>

</div>


              {/* =================================================
SUMMARY
              ================================================= */}

<motion.aside

className="cart-summary"

initial={{
opacity: 0,
x: 30,
                }}

animate={{
opacity: 1,
x: 0,
                }}

transition={{
duration: 0.5,
delay: 0.15,
                }}

>

<h2>
Order Summary
</h2>


<div className="summary-row">

<span>
Subtotal
</span>

<span>
                    ${subtotal.toFixed(2)}
</span>

</div>


<div className="summary-row">

<span>
Shipping
</span>

<span>
                    ${shipping.toFixed(2)}
</span>

</div>


<hr />


<div className="summary-total">

<span>
Total
</span>

<span>
                    ${total.toFixed(2)}
</span>

</div>


<button

className="checkout-btn"

onClick={() =>
navigate("/checkout")
                  }

>

<FaShoppingBag />

Proceed To Checkout

</button>


<button

className="continue-shopping"

onClick={() =>
navigate("/products")
                  }

>

Continue Shopping

</button>

</motion.aside>

</div>

</>

        )}


</motion.main>

</>

  );

}


export default Cart;

