import "./Cart.css";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaMinus, FaPlus, FaShoppingBag, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";

import { useCart } from "../../context/CartContext";
import { formatPrice, getImageUrl } from "../../utils/products";

function Cart({ setFlyItem }) {
const navigate = useNavigate();
const {
cartItems,
increaseItem,
decreaseItem,
removeItem,
getProductQuantity,
  } = useCart();

const subtotal = cartItems.reduce(
    (sum, item) =>
sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

const handleIncrease = (item, event) => {
const image = event.currentTarget
      .closest(".cart-card")
      ?.querySelector(".cart-image-wrapper img");
const rect = image?.getBoundingClientRect();

const result = increaseItem(item.cartKey);

if (!result.ok) {
if (result.message) toast.error(result.message);
return;
    }

if (rect && setFlyItem) {
setFlyItem({ image: getImageUrl(item), rect });
    }
  };

return (
<motion.main
className="cart-page"
initial={{ opacity: 0, x: 60 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -60 }}
transition={{ duration: 0.45 }}
>
      {cartItems.length === 0 ? (
<motion.div
className="empty-cart"
initial={{ opacity: 0, y: 40 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
>
<div className="empty-icon">🛒</div>
<h2>Your cart is empty</h2>
<p>Looks like you haven't added anything yet.</p>
<button
type="button"
className="continue-btn"
onClick={() => navigate("/products")}
>
Continue shopping
</button>
</motion.div>
      ) : (
<>
<motion.h1
className="cart-title"
initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.2, duration: 0.5 }}
>
Shopping cart
</motion.h1>

<div className="cart-layout">
<div className="cart-products">
<AnimatePresence>
                {cartItems.map((item) => {
const quantity = Number(item.quantity) || 1;
const stock = Number(item.stock) || 0;
const price = Number(item.price) || 0;
const inCart = getProductQuantity(item.id);
const remaining = Math.max(0, stock - inCart);
const soldOut = stock <= 0;
const atMax = !soldOut && remaining <= 0;

return (
<motion.div
layout
key={item.cartKey}
className={soldOut ? "cart-card cart-card-out" : "cart-card"}
initial={{ opacity: 0, x: 50 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -50 }}
transition={{ duration: 0.35 }}
>
<div className="cart-image-wrapper">
<img
src={getImageUrl(item)}
alt={item.name}
onError={(event) => {
event.currentTarget.style.display = "none";
                          }}
                        />
                        {soldOut&& (
<span className="cart-out-badge">OUT OF STOCK</span>
                        )}
</div>

<div className="cart-info">
<h3>{item.name}</h3>
<p className="category">{item.category || "Product"}</p>

                        {(item.color || item.size) && (
<div className="cart-variants">
                            {item.color&& (
<span className="cart-variant">{item.color}</span>
                            )}
                            {item.size&& (
<span className="cart-variant">{item.size}</span>
                            )}
</div>
                        )}

<div className="price">{formatPrice(price)}</div>

<div className={soldOut ? "cart-stock out" : "cart-stock"}>
<span />
                          {soldOut
                            ? "Out of stock"
                            : atMax
                            ? "No more units available"
                            : `${remaining} more available`}
</div>
</div>

<div className="quantity-section">
<span className="quantity-label">Quantity</span>

<div className="quantity-box">
<button
type="button"
className="quantity-btn"
aria-label="Decrease quantity"
disabled={quantity <= 1}
onClick={() => decreaseItem(item.cartKey)}
>
<FaMinus />
</button>

<span className="quantity-number">{quantity}</span>

<button
type="button"
className="quantity-btn plus"
aria-label="Increase quantity"
disabled={soldOut || atMax}
onClick={(event) => handleIncrease(item, event)}
>
<FaPlus />
</button>
</div>

                        {atMax&& (
<small className="max-stock-text">
Maximum available
</small>
                        )}
</div>

<div className="item-total">
                        {formatPrice(price * quantity)}
</div>

<button
type="button"
className="remove-btn"
aria-label="Remove item"
onClick={() => removeItem(item.cartKey)}
>
<FaTrashAlt />
</button>
</motion.div>
                  );
                })}
</AnimatePresence>
</div>

<motion.aside
className="cart-summary"
initial={{ opacity: 0, x: 30 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.5, delay: 0.15 }}
>
<h2>Order summary</h2>

<div className="summary-row">
<span>Subtotal</span>
<span>{formatPrice(subtotal)}</span>
</div>

<div className="summary-row">
<span>Shipping</span>
<span>Calculated at checkout</span>
</div>

<hr />

<div className="summary-total">
<span>Total</span>
<span>{formatPrice(subtotal)}</span>
</div>

<button
type="button"
className="checkout-btn"
onClick={() => navigate("/checkout")}
>
<FaShoppingBag />
Proceed to checkout
</button>

<button
type="button"
className="continue-shopping"
onClick={() => navigate("/products")}
>
Continue shopping
</button>
</motion.aside>
</div>
</>
      )}
</motion.main>
  );
}

export default Cart;

