import "./Profile.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaBoxOpen, FaSignOutAlt } from "react-icons/fa";

import { API_URL, formatPrice, getImageUrl } from "../../utils/products";

const STEPS = ["pending", "confirmed", "preparing", "ready", "delivered"];

const LABELS = {
pending: "Pending",
confirmed: "Confirmed",
preparing: "Preparing",
ready: "Ready",
delivered: "Delivered",
cancelled: "Cancelled",
};

const SHIPPING_LABELS = {
pickup: "Store pickup",
standard: "Standard shipping",
express: "Express shipping",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const isActive = (order) =>
order.status !== "delivered" && order.status !== "cancelled";

const readUser = () => {
try {
return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
return null;
  }
};

const formatDate = (value) => {
const date = new Date(value);

if (!value || Number.isNaN(date.getTime())) return "";

return date.toLocaleDateString(undefined, {
year: "numeric",
month: "short",
day: "numeric",
  });
};

function Profile() {
const navigate = useNavigate();
const [user] = useState(readUser);
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [filter, setFilter] = useState("all");
const [cancelTarget, setCancelTarget] = useState(null);
const [cancelling, setCancelling] = useState(false);

const signOut = useCallback(() => {
localStorage.removeItem("token");
localStorage.removeItem("user");
localStorage.removeItem("authToken");
navigate("/login", { replace: true });
  }, [navigate]);

const loadOrders = useCallback(async () => {
try {
const response = await fetch(`${API_URL}/api/orders/my`, {
headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

if (response.status === 401) {
signOut();
return;
      }

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Unable to load your orders");
      }

setOrders(Array.isArray(data.orders) ? data.orders : []);
setError("");
    } catch (err) {
setError(err.message || "Unable to load your orders");
    } finally {
setLoading(false);
    }
  }, [signOut]);

useEffect(() => {
window.scrollTo({ top: 0, behavior: "auto" });
loadOrders();

const interval = setInterval(loadOrders, 10000);

return () => clearInterval(interval);
  }, [loadOrders]);

const stats = useMemo(
    () => ({
total: orders.length,
active: orders.filter(isActive).length,
delivered: orders.filter((order) => order.status === "delivered").length,
spent: orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
    }),
    [orders]
  );

const visible = useMemo(() => {
if (filter === "active") return orders.filter(isActive);
if (filter === "all") return orders;
return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

const confirmCancel = async () => {
if (!cancelTarget) return;

try {
setCancelling(true);

const response = await fetch(
        `${API_URL}/api/orders/${cancelTarget}/cancel`,
        {
method: "PUT",
headers: {
Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Unable to cancel this order");
      }

toast.success("Your order was cancelled");
setCancelTarget(null);
await loadOrders();
    } catch (err) {
toast.error(err.message || "Unable to cancel this order");
    } finally {
setCancelling(false);
    }
  };

const name = user?.name || "Your account";
const initial = name.trim().charAt(0).toUpperCase() || "M";

return (
<motion.main
className="profile"
initial={{ opacity: 0, x: 60 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -60 }}
transition={{ duration: 0.45 }}
>
<section className="profile-hero">
<div className="profile-avatar" aria-hidden="true">
          {initial}
</div>

<div className="profile-identity">
<h1>{name}</h1>
<p>{user?.email}</p>
</div>

<button type="button" className="profile-logout" onClick={signOut}>
<FaSignOutAlt />
<span>Log out</span>
</button>
</section>

<section className="profile-stats">
<div className="profile-stat">
<strong>{stats.total}</strong>
<span>Orders</span>
</div>
<div className="profile-stat">
<strong>{stats.active}</strong>
<span>In progress</span>
</div>
<div className="profile-stat">
<strong>{stats.delivered}</strong>
<span>Delivered</span>
</div>
<div className="profile-stat">
<strong>{formatPrice(stats.spent)}</strong>
<span>Total spent</span>
</div>
</section>

<section className="profile-orders">
<div className="profile-orders-head">
<h2>My orders</h2>

<div className="profile-filters" role="tablist">
            {FILTERS.map((item) => (
<button
key={item.id}
type="button"
role="tab"
aria-selected={filter === item.id}
className={filter === item.id ? "active" : ""}
onClick={() => setFilter(item.id)}
>
                {item.label}
</button>
            ))}
</div>
</div>

        {loading ? (
<div className="po-list">
            {[0, 1].map((key) => (
<div className="po-card po-skeleton" key={key} />
            ))}
</div>
        ) : error && orders.length === 0 ? (
<div className="po-empty">
<h3>We couldn't load your orders</h3>
<p>{error}</p>
<button type="button" className="po-btn primary" onClick={loadOrders}>
Try again
</button>
</div>
        ) : visible.length === 0 ? (
<div className="po-empty">
<div className="po-empty-icon">
<FaBoxOpen />
</div>
<h3>{orders.length === 0 ? "No orders yet" : "Nothing here"}</h3>
<p>
              {orders.length === 0
                ? "When you place an order, you can follow it here."
                : "No orders match this filter."}
</p>
            {orders.length === 0&& (
<Link to="/products" className="po-btn primary">
Browse products
</Link>
            )}
</div>
        ) : (
<div className="po-list">
<AnimatePresence>
              {visible.map((order) => {
const stepIndex = STEPS.indexOf(order.status);

return (
<motion.article
layout
key={order.id}
className="po-card"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.3 }}
>
<header className="po-head">
<div>
<h3>Order #{order.id}</h3>
<span>{formatDate(order.created_at)}</span>
</div>
<span className={`po-status po-${order.status}`}>
                        {LABELS[order.status] || order.status}
</span>
</header>

                    {order.status === "cancelled" ? (
<p className="po-note">
This order was cancelled and its items went back to stock.
</p>
                    ) : (
<ol className="po-steps" aria-label="Order progress">
                        {STEPS.map((step, index) => (
<li
key={step}
className={
index < stepIndex
                                ? "done"
                                : index === stepIndex
                                ? "current"
                                : ""
                            }
>
<span />
<small>{LABELS[step]}</small>
</li>
                        ))}
</ol>
                    )}

<ul className="po-items">
                      {order.items.map((item, index) => (
<li key={`${item.product_id}-${index}`}>
<img src={getImageUrl(item)} alt="" />
<div>
<strong>{item.name || "Product"}</strong>
                            {(item.color || item.size) && (
<small>
                                {[item.color, item.size].filter(Boolean).join(" • ")}
</small>
                            )}
</div>
<span>×{item.quantity || 1}</span>
</li>
                      ))}
</ul>

<footer className="po-foot">
<div>
<small>
                          {SHIPPING_LABELS[order.shipping_method] ||
order.shipping_method}
</small>
<strong>{formatPrice(order.total)}</strong>
</div>

<div className="po-actions">
                        {order.status === "pending" && (
<button
type="button"
className="po-btn danger"
onClick={() => setCancelTarget(order.id)}
>
Cancel order
</button>
                        )}
<Link to={`/track/${order.id}`} className="po-btn primary">
Track order
</Link>
</div>
</footer>
</motion.article>
                );
              })}
</AnimatePresence>
</div>
        )}
</section>

      {cancelTarget&& (
<div
className="po-modal"
role="dialog"
aria-modal="true"
onClick={() => !cancelling && setCancelTarget(null)}
>
<div className="po-modal-card" onClick={(event) => event.stopPropagation()}>
<h3>Cancel order #{cancelTarget}?</h3>
<p>
The items will go back to stock. You can only cancel an order
before it is confirmed.
</p>
<div className="po-modal-actions">
<button
type="button"
className="po-btn ghost"
disabled={cancelling}
onClick={() => setCancelTarget(null)}
>
Keep order
</button>
<button
type="button"
className="po-btn danger solid"
disabled={cancelling}
onClick={confirmCancel}
>
                {cancelling ? "Cancelling..." : "Yes, cancel"}
</button>
</div>
</div>
</div>
      )}
</motion.main>
  );
}

export default Profile;

