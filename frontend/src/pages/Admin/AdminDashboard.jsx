import "./AdminDashboard.css";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
FaBoxOpen,
FaDollarSign,
FaClock,
FaCheckCircle,
FaCog,
FaClipboardCheck,
FaTruck,
FaTimesCircle,
FaUsers,
FaStar,
FaPhoneAlt,
FaMapMarkerAlt,
FaCreditCard,
FaClipboardList,
} from "react-icons/fa";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";


const API_URL = "http://localhost:5000";


function AdminDashboard() {

const [orders, setOrders] = useState([]);
const [totalUsers, setTotalUsers] = useState(0);


  // =====================================================
  // GET TOKEN
  // =====================================================

const getToken = () => {

return (
localStorage.getItem("token") ||
localStorage.getItem("authToken")
    );

  };


  // =====================================================
  // FETCH DATA
  // =====================================================

useEffect(() => {

const fetchDashboardData = async () => {

try {

const token = getToken();


const headers = {
Authorization: `Bearer ${token}`,
        };


        // ORDERS

const ordersRes = await fetch(
          `${API_URL}/api/orders`,
          {
headers,
          }
        );


const ordersData = await ordersRes.json();


if (!ordersRes.ok) {

console.error(
ordersData.message || "Failed to fetch orders"
          );

return;

        }


setOrders(
Array.isArray(ordersData)
            ? ordersData
            : []
        );


        // USERS

const usersRes = await fetch(
  `${API_URL}/api/count`,
  {
headers,
  }
);


const usersData = await usersRes.json();


if (usersRes.ok) {

setTotalUsers(
Number(usersData.totalUsers) || 0
          );

        }


      } catch (error) {

console.error(
          "Dashboard Error:",
error
        );

      }

    };


fetchDashboardData();


const interval = setInterval(
fetchDashboardData,
      5000
    );


return () =>
clearInterval(interval);

  }, []);


  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

const updateStatus = async (
id,
status
  ) => {

try {

const token = getToken();


const res = await fetch(
        `${API_URL}/api/orders/${id}`,
        {

method: "PUT",

headers: {
            "Content-Type": "application/json",
Authorization: `Bearer ${token}`,
          },

body: JSON.stringify({
status,
          }),

        }
      );


const data =
await res.json();


if (!res.ok) {

alert(
data.message ||
          "Failed to update order"
        );

return;

      }


setOrders((prevOrders) =>

prevOrders.map((order) =>

order.id === id

            ? {
                ...order,
status,
              }

            : order

        )

      );


    } catch (error) {

console.error(
        "Update Status Error:",
error
      );

    }

  };


  // =====================================================
  // STATISTICS
  // =====================================================

const totalSales =
orders.reduce(
      (sum, order) =>
sum + Number(order.total || 0),
      0
    );


const pendingOrders =
orders.filter(
      (order) =>
order.status === "pending"
    ).length;


const confirmedOrders =
orders.filter(
      (order) =>
order.status === "confirmed"
    ).length;


const preparingOrders =
orders.filter(
      (order) =>
order.status === "preparing"
    ).length;


const readyOrders =
orders.filter(
      (order) =>
order.status === "ready"
    ).length;


const deliveredOrders =
orders.filter(
      (order) =>
order.status === "delivered"
    ).length;


const cancelledOrders =
orders.filter(
      (order) =>
order.status === "cancelled"
    ).length;


const completedRate =
orders.length
      ? (
          (deliveredOrders /
orders.length) *
          100
        ).toFixed(1)
      : 0;


const ratedOrders =
orders.filter(
      (order) =>
Number(order.rating) > 0
    );


const averageRating =
ratedOrders.length
      ? (
ratedOrders.reduce(
            (sum, order) =>
sum +
Number(order.rating),
            0
          ) /
ratedOrders.length
        ).toFixed(1)
      : 0;


  // =====================================================
  // ORDER ITEMS
  // =====================================================

const getOrderItems = (items) => {

if (!items)
return [];


try {

const parsed =
typeof items === "string"
          ? JSON.parse(items)
          : items;


return Array.isArray(parsed)
        ? parsed
        : [];

    } catch {

return [];

    }

  };


  // =====================================================
  // STATUS LABEL
  // =====================================================

const formatStatus = (status) => {

if (!status)
return "Unknown";


return status
      .charAt(0)
      .toUpperCase() +
status.slice(1);

  };


  // =====================================================
  // STATUS BUTTON
  // =====================================================

const renderStatusButton = (
order
  ) => {

switch (order.status) {

case "pending":

return (

<button
className="admin-action confirm-action"
onClick={() =>
updateStatus(
order.id,
                "confirmed"
              )
            }
>

<FaCheckCircle />

Confirm Order

</button>

        );


case "confirmed":

return (

<button
className="admin-action preparing-action"
onClick={() =>
updateStatus(
order.id,
                "preparing"
              )
            }
>

<FaCog />

Start Preparing

</button>

        );


case "preparing":

return (

<button
className="admin-action ready-action"
onClick={() =>
updateStatus(
order.id,
                "ready"
              )
            }
>

<FaClipboardCheck />

Mark Ready

</button>

        );


case "ready":

return (

<button
className="admin-action delivered-action"
onClick={() =>
updateStatus(
order.id,
                "delivered"
              )
            }
>

<FaTruck />

Mark Delivered

</button>

        );


case "delivered":

return (

<span className="completed-label">

<FaCheckCircle />

Completed

</span>

        );


case "cancelled":

return (

<span className="cancelled-label">

<FaTimesCircle />

Cancelled

</span>

        );


default:

return null;

    }

  };


return (

<div className="admin-page">

<AdminSidebar />

<main className="admin-dashboard-content">


        {/* =================================================
HEADER
        ================================================= */}

<motion.div
className="dashboard-header"

initial={{
opacity: 0,
x: -40,
          }}

animate={{
opacity: 1,
x: 0,
          }}

transition={{
duration: 0.5,
          }}
>

<div>

<p className="dashboard-eyebrow">
E-COMMERCE ADMINISTRATION
</p>

<h1>
Orders Dashboard
</h1>

<p className="dashboard-subtitle">
Manage orders, monitor sales,
and track your store performance.
</p>

</div>

</motion.div>



        {/* =================================================
STATISTICS
        ================================================= */}

<div className="stats-container">


<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaBoxOpen className="stat-icon" />

<h3>
              {orders.length}
</h3>

<p>
Total Orders
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaDollarSign className="stat-icon" />

<h3>
              ${totalSales.toFixed(2)}
</h3>

<p>
Total Sales
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaClock className="stat-icon" />

<h3>
              {pendingOrders}
</h3>

<p>
Pending
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaCheckCircle className="stat-icon" />

<h3>
              {confirmedOrders}
</h3>

<p>
Confirmed
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaCog className="stat-icon" />

<h3>
              {preparingOrders}
</h3>

<p>
Preparing
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaClipboardCheck className="stat-icon" />

<h3>
              {readyOrders}
</h3>

<p>
Ready
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaTruck className="stat-icon" />

<h3>
              {deliveredOrders}
</h3>

<p>
Delivered
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaTimesCircle className="stat-icon" />

<h3>
              {cancelledOrders}
</h3>

<p>
Cancelled
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaUsers className="stat-icon" />

<h3>
              {totalUsers}
</h3>

<p>
Total Users
</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaStar className="stat-icon" />

<h3>

              {ratedOrders.length
                ? averageRating
                : "--"}

</h3>

<p>

              {ratedOrders.length
                ? "Average Rating"
                : "No Ratings"}

</p>

</motion.div>



<motion.div
className="stat-card"

whileHover={{
y: -8,
scale: 1.02,
            }}
>

<FaClipboardCheck className="stat-icon" />

<h3>
              {completedRate}%
</h3>

<p>
Completion Rate
</p>

</motion.div>


</div>



        {/* =================================================
ORDERS
        ================================================= */}

<section className="orders-section">

<div className="section-heading">

<div>

<p>
ORDER MANAGEMENT
</p>

<h2>
Recent Orders
</h2>

</div>

<span>
{orders.length} Orders
</span>

</div>



<div className="orders-container">

            {orders.length === 0 ? (

<div className="empty-orders">

<FaBoxOpen />

<h3>
No Orders Yet
</h3>

<p>
New customer orders will
appear here.
</p>

</div>

            ) : (

orders.map((order) => {

const items =
getOrderItems(
order.items
                  );


return (

<motion.article

key={order.id}

className="order-card"

initial={{
opacity: 0,
y: 25,
                    }}

animate={{
opacity: 1,
y: 0,
                    }}

whileHover={{
y: -5,
                    }}

>


<div className="order-card-header">

<div>

<span className="order-label">
ORDER
</span>

<h2>
                          #{order.id}
</h2>

</div>


<span
className={`status-badge status-${order.status}`}
>

                        {formatStatus(
order.status
                        )}

</span>

</div>



<div className="customer-section">

<h3>
                        {order.customer_name}
</h3>

<div className="order-info">

<p>

<FaPhoneAlt />

                          {order.phone}

</p>


<p>

<FaMapMarkerAlt />

                          {order.address}

</p>


<p>

<FaCreditCard />

                          {order.payment_method}

</p>

</div>

</div>



<div className="items-section">

<h4>

<FaClipboardList />

Ordered Products

</h4>


<ul>

                        {items.map(
                          (item, index) => (

<li
key={
index
                              }
>

<span>

                                {item.name ||
                                  "Product"}

</span>

<strong>

                                ×
                                {item.quantity ||
                                  1}

</strong>

</li>

                          )
                        )}

</ul>

</div>



<div className="order-bottom">


<div>

<span>
Shipping
</span>

<strong>
                          {order.shipping_method}
</strong>

</div>


<div>

<span>
Total
</span>

<strong>
                          $
                          {Number(
order.total || 0
                          ).toFixed(2)}
</strong>

</div>


</div>



                    {order.payment_image&& (

<div className="payment-proof-wrapper">

<span>
Payment Proof
</span>

<img

src={`${API_URL}/uploads/${order.payment_image}`}

alt="Payment proof"

className="payment-proof"

                        />

</div>

                    )}



<div className="order-actions">

                      {renderStatusButton(
order
                      )}

</div>



                    {Number(order.rating) > 0&& (

<div className="order-rating">

<span>
Customer Rating
</span>

<strong>

                          {"⭐".repeat(
Number(order.rating)
                          )}

</strong>

<small>
                          ({order.rating}/5)
</small>

</div>

                    )}


</motion.article>

                );

              })

            )}

</div>

</section>


</main>


<button

className="scroll-top"

onClick={() =>
window.scrollTo({
top: 0,
behavior: "smooth",
          })
        }

>
        ↑
</button>


<button

className="scroll-bottom"

onClick={() =>
window.scrollTo({
top:
document.body.scrollHeight,
behavior: "smooth",
          })
        }

>
        ↓
</button>


</div>

  );

}


export default AdminDashboard;

