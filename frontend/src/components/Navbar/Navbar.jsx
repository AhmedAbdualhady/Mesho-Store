import "./Navbar.css";

import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import {
FaHeart,
FaMoon,
FaShoppingCart,
FaSignInAlt,
FaSignOutAlt,
FaSun,
FaTachometerAlt,
FaUserCircle,
} from "react-icons/fa";

import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { API_URL } from "../../utils/products";

const readUser = () => {
try {
return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
return null;
  }
};

function Navbar({ darkMode, setDarkMode, cartShake }) {
const navigate = useNavigate();
const cartRef = useRef(null);
const { cartCount } = useCart();
const { wishlistItems } = useWishlist();

const [menuOpen, setMenuOpen] = useState(false);
const [settings, setSettings] = useState({});

const token = localStorage.getItem("token");
const user = readUser();
const loggedIn = Boolean(token);
const isAdmin = Number(user?.is_admin) === 1;

useEffect(() => {
const loadSettings = async () => {
try {
const response = await fetch(`${API_URL}/api/settings`);

if (!response.ok) throw new Error("Failed to load settings");

setSettings((await response.json()) || {});
      } catch (error) {
console.error("Navbar settings error:", error);
      }
    };

loadSettings();
  }, []);

useEffect(() => {
window.cartTarget = cartRef;
  }, []);

useEffect(() => {
document.body.style.overflow = menuOpen ? "hidden" : "";

return () => {
document.body.style.overflow = "";
    };
  }, [menuOpen]);

const closeMenu = () => setMenuOpen(false);

const goTo = (path) => {
window.scrollTo({ top: 0, behavior: "auto" });
setMenuOpen(false);
navigate(path);
  };

const logout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");
localStorage.removeItem("authToken");
setMenuOpen(false);
navigate("/login");
  };

const storeName = settings.restaurant_name || "MeshoStore";

return (
<>
<motion.nav
className="navbar"
initial={{ y: -80, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.6 }}
>
<div className="nav-container">
<button
type="button"
className="logo"
aria-label="Go to home"
onClick={() => goTo("/")}
>
<img
src={
settings.logo
                  ? `${API_URL}${settings.logo}`
                  : "/default-logo.png"
              }
alt={`${storeName} logo`}
            />
<span className="logo-text">
<strong>{storeName}</strong>
              {settings.navbar_subtitle &&<small>{settings.navbar_subtitle}</small>}
</span>
</button>

<ul className={menuOpen ? "nav-links open" : "nav-links"}>
<li>
<NavLink to="/" end onClick={closeMenu}>
Home
</NavLink>
</li>
<li>
<NavLink to="/products" onClick={closeMenu}>
Products
</NavLink>
</li>
<li>
<NavLink to="/categories" onClick={closeMenu}>
Categories
</NavLink>
</li>
<li>
<NavLink to="/about" onClick={closeMenu}>
About
</NavLink>
</li>
<li>
<NavLink to="/contact" onClick={closeMenu}>
Contact
</NavLink>
</li>

            {loggedIn ? (
<>
<li className="nav-mobile-only nav-divider">
<NavLink to="/profile" onClick={closeMenu}>
My account
</NavLink>
</li>
                {isAdmin&& (
<li className="nav-mobile-only">
<NavLink to="/admin/dashboard" onClick={closeMenu}>
Dashboard
</NavLink>
</li>
                )}
<li className="nav-mobile-only">
<button type="button" className="nav-logout" onClick={logout}>
Log out
</button>
</li>
</>
            ) : (
<>
<li className="nav-mobile-only nav-divider">
<NavLink to="/login" onClick={closeMenu}>
Log in
</NavLink>
</li>
<li className="nav-mobile-only">
<NavLink to="/register" onClick={closeMenu}>
Create account
</NavLink>
</li>
</>
            )}
</ul>

<div className="nav-actions">
<button
type="button"
className="nav-icon-btn"
aria-label="Wishlist"
onClick={() => goTo("/wishlist")}
>
<span className="nav-icon-wrap">
<FaHeart />
                {wishlistItems.length > 0&& (
<span className="nav-badge">{wishlistItems.length}</span>
                )}
</span>
<span className="nav-label">Wishlist</span>
</button>

<button
type="button"
className="nav-icon-btn"
aria-label="Cart"
onClick={() => goTo("/cart")}
>
<motion.span
className="nav-icon-wrap cart-icon"
ref={cartRef}
animate={
cartShake
                    ? {
rotate: [0, -10, 10, -8, 8, -4, 4, 0],
scale: [1, 1.15, 0.95, 1],
                      }
                    : { rotate: 0, scale: 1 }
                }
transition={{ duration: 0.45 }}
>
<FaShoppingCart />
                {cartCount > 0 &&<span className="nav-badge">{cartCount}</span>}
</motion.span>
<span className="nav-label">Cart</span>
</button>

            {loggedIn ? (
<>
                {isAdmin&& (
<button
type="button"
className="nav-icon-btn nav-account"
aria-label="Dashboard"
onClick={() => goTo("/admin/dashboard")}
>
<FaTachometerAlt />
<span className="nav-label">Dashboard</span>
</button>
                )}
<button
type="button"
className="nav-icon-btn nav-account"
aria-label="My account"
onClick={() => goTo("/profile")}
>
<FaUserCircle />
<span className="nav-label">Account</span>
</button>
<button
type="button"
className="nav-icon-btn nav-account nav-ghost"
aria-label="Log out"
onClick={logout}
>
<FaSignOutAlt />
</button>
</>
            ) : (
<button
type="button"
className="nav-icon-btn nav-account"
aria-label="Log in"
onClick={() => goTo("/login")}
>
<FaSignInAlt />
<span className="nav-label">Login</span>
</button>
            )}

<button
type="button"
className="nav-theme"
aria-label="Toggle dark mode"
onClick={() => setDarkMode(!darkMode)}
>
              {darkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
</button>

<button
type="button"
className="nav-menu-btn"
aria-label={menuOpen ? "Close menu" : "Open menu"}
aria-expanded={menuOpen}
onClick={() => setMenuOpen(!menuOpen)}
>
              {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
</button>
</div>
</div>
</motion.nav>

      {menuOpen&& (
<button
type="button"
className="nav-backdrop"
aria-label="Close menu"
onClick={closeMenu}
        />
      )}
</>
  );
}

export default Navbar;
