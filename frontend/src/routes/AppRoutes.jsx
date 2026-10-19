import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Wishlist from "../pages/Wishlist/Wishlist";
import Checkout from "../pages/Checkout/Checkout";
import Success from "../pages/Success/Success";
import TrackOrder from "../pages/TrackOrder/TrackOrder";
import Categories from "../pages/Categories/Categories";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Profile from "../pages/Profile/Profile";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminSettings from "../pages/Admin/AdminSettings";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import FlyToCart from "../components/FlyToCart/FlyToCart";

const readUser = () => {
try {
return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
return null;
  }
};

function RequireAuth({ children }) {
const location = useLocation();

if (!localStorage.getItem("token")) {
return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

return children;
}

function RequireAdmin({ children }) {
const user = readUser();

if (!localStorage.getItem("token") || Number(user?.is_admin) !== 1) {
return <Navigate to="/" replace />;
  }

return children;
}

function AppRoutes() {
const location = useLocation();
const isAdmin = location.pathname.startsWith("/admin");

const [darkMode, setDarkMode] = useState(
localStorage.getItem("theme") === "dark"
  );
const [flyItem, setFlyItem] = useState(null);
const [cartShake, setCartShake] = useState(false);

useEffect(() => {
document.body.classList.toggle("dark", darkMode);
localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

return (
<>
<Navbar
darkMode={darkMode}
setDarkMode={setDarkMode}
cartShake={cartShake}
      />

<AnimatePresence mode="wait">
<Routes location={location} key={location.pathname}>
<Route path="/" element={<Home setFlyItem={setFlyItem} />} />
<Route
path="/products"
element={<Products setFlyItem={setFlyItem} />}
          />
<Route
path="/products/:id"
element={<ProductDetails setFlyItem={setFlyItem} />}
          />
<Route path="/cart" element={<Cart setFlyItem={setFlyItem} />} />
<Route
path="/wishlist"
element={<Wishlist setFlyItem={setFlyItem} />}
          />
<Route path="/checkout" element={<Checkout />} />
<Route path="/success" element={<Success />} />
<Route path="/track/:id" element={<TrackOrder />} />
<Route path="/categories" element={<Categories />} />
<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route
path="/profile"
element={
<RequireAuth>
<Profile />
</RequireAuth>
            }
          />
<Route
path="/admin/products"
element={
<RequireAdmin>
<AdminProducts />
</RequireAdmin>
            }
          />
<Route
path="/admin/dashboard"
element={
<RequireAdmin>
<AdminDashboard />
</RequireAdmin>
            }
          />
<Route
path="/admin/settings"
element={
<RequireAdmin>
<AdminSettings />
</RequireAdmin>
            }
          />
<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
</AnimatePresence>

<FlyToCart
flyItem={flyItem}
setFlyItem={setFlyItem}
setCartShake={setCartShake}
      />

      {!isAdmin &&<Footer />}
</>
  );
}

export default AppRoutes;

