import "./Navbar.css";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

import {
HiOutlineMenuAlt3,
HiOutlineX
} from "react-icons/hi";

import {
FaShoppingCart,
FaHeart,
FaSignInAlt,
FaSignOutAlt,
FaMoon,
FaSun
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";


const API_URL =
  "http://localhost:5000";



  
function Navbar({
darkMode,
setDarkMode,
cartShake
}) {

        
const [menuOpen, setMenuOpen] = useState(false);

const [settings, setSettings] =
useState({});


useEffect(() => {

const fetchSettings = async () => {

try {

const response =
await fetch(
          `${API_URL}/api/settings`
        );

if (!response.ok) {
throw new Error(
          "Failed to load settings"
        );
      }

const data =
await response.json();

setSettings(data || {});

    } catch (error) {

console.error(
        "Navbar Settings Error:",
error
      );

    }

  };

fetchSettings();

}, []);





const { cartItems } = useCart();

const { wishlistItems } = useWishlist();

const cartRef = useRef(null);

const navigate = useNavigate();

const goToPage = (path) => {
window.scrollTo({
top: 0,
behavior: "auto",
  });

navigate(path);
};



  // ==========================================
  // TOTAL CART QUANTITY
  // ==========================================

const totalCartQuantity = cartItems.reduce(
    (total, item) =>
total + Number(item.quantity || 1),
    0
  );


  // ==========================================
  // CART TARGET
  // ==========================================

useEffect(() => {

window.cartTarget = cartRef;

  }, []);


  // ==========================================
  // LOGOUT
  // ==========================================

const logout = () => {

localStorage.removeItem("token");
localStorage.removeItem("user");
localStorage.removeItem("authToken");

navigate("/login");

  };


return (

<motion.nav

className="navbar"

initial={{
y: -100,
opacity: 0
      }}

animate={{
y: 0,
opacity: 1
      }}

transition={{
duration: .8
      }}

>

<div className="nav-container">


        {/* =========================
LOGO
        ========================= */}

<motion.div

className="logo"

whileHover={{
scale: 1.05
          }}

transition={{
type: "spring",
stiffness: 300
          }}

>


<img
src={
settings.logo
      ? `${API_URL}${settings.logo}`
      : "/default-logo.png"
  }
alt={`${settings.restaurant_name || "NovaStore"} Logo`}
/>


<div className="logo-text">


<h2>
  {settings.restaurant_name}
</h2>

<p>
  {settings.navbar_subtitle || ""}
</p>

</div>

</motion.div>


        {/* =========================
NAV LINKS
        ========================= */}

<ul
className={`nav-links ${
menuOpen ? "active" : ""
          }`}
>

<li>
<NavLink to="/">
Home
</NavLink>
</li>

<li>
<NavLink to="/products">
Products
</NavLink>
</li>

<li>
<NavLink to="/categories">
Categories
</NavLink>
</li>

<li>
<NavLink to="/about">
About
</NavLink>
</li>

<li>
<NavLink to="/contact">
Contact
</NavLink>
</li>

</ul>


        {/* =========================
MOBILE MENU
        ========================= */}

<div

className="menu-icon"

onClick={() =>
setMenuOpen(!menuOpen)
          }

>

          {menuOpen
            ? <HiOutlineX />
            : <HiOutlineMenuAlt3 />
          }

</div>


        {/* =========================
BUTTONS
        ========================= */}

<div className="nav-buttons">


          {/* LOGIN / LOGOUT */}

          {!localStorage.getItem("token") ? (

<button

className="login-button"

onClick={() =>goToPage("/login")}
>

<FaSignInAlt />

<span>
Login
</span>

</button>

          ) : (

<button

className="logout-button"

onClick={logout}

>

<FaSignOutAlt />

<span>
Logout
</span>

</button>

          )}


          {/* CART */}

<button

className="nav-action-button"

onClick={() =>goToPage("/cart")}
>


<motion.div
className="cart-icon"
ref={cartRef}

animate={
cartShake
      ? {
rotate: [0, -10, 10, -8, 8, -4, 4, 0],
scale: [1, 1.15, 0.95, 1],
        }
      : {
rotate: 0,
scale: 1,
        }
  }

transition={{
duration: 0.45,
  }}
>

<FaShoppingCart />

  {totalCartQuantity> 0&& (
<span className="cart-count">
      {totalCartQuantity}
</span>
  )}

</motion.div>

<span>
Cart
</span>

</button>


          {/* WISHLIST */}

<button

className="nav-action-button"

onClick={() =>goToPage("/wishlist")}
>

<div className="wishlist-nav-icon">

<FaHeart />

              {wishlistItems.length > 0&& (

<span className="wishlist-nav-count">

                  {wishlistItems.length}

</span>

              )}

</div>

<span>
Wishlist
</span>

</button>


</div>


<button
className={`dark-btn ${darkMode ? "active" : ""}`}
onClick={()=>setDarkMode(!darkMode)}
>

<span className="icon">
{darkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon"/>}
</span>


</button>



</div>

</motion.nav>

  );

}


export default Navbar;



