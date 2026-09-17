import "./TrackOrder.css";

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
FaBoxOpen,
FaCheckCircle,
FaHeart,
} from "react-icons/fa";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000";

function TrackOrder() {
const { id } = useParams();

const [order, setOrder] = useState(null);
const [rating, setRating] = useState(0);
const [rated, setRated] = useState(false);
const [ratingLoading, setRatingLoading] = useState(false);

  // =====================================================
  // SCROLL TOP
  // =====================================================

useEffect(() => {
window.scrollTo({
top: 0,
behavior: "auto",
    });
  }, []);

  // =====================================================
  // FETCH ORDER
  // =====================================================

useEffect(() => {
if (!id) return;

const fetchOrder = async () => {
try {
const token = localStorage.getItem("token");

const response = await fetch(
          `${API_URL}/api/orders/${id}`,
          {
headers: token
              ? {
Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

if (!response.ok) {
throw new Error("Failed to load order");
        }

const data = await response.json();

setOrder(data);

        // If order already has rating
if (data.rating) {
setRating(Number(data.rating));
setRated(true);
        }
      } catch (error) {
console.error("Track Order Error:", error);

toast.error("Unable to load your order");
      }
    };

    // First request
fetchOrder();

    // Update order every 3 seconds
const interval = setInterval(fetchOrder, 3000);

return () => clearInterval(interval);
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

if (!order) {
return (
<div className="track-loading">
Loading order...
</div>
    );
  }

  // =====================================================
  // ORDER STATUS
  // =====================================================

const steps = [
    "Pending",
    "Accepted",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  /*
Handle different possible status formats
coming from backend.
  */

const normalizedStatus = String(
order.status || "Pending"
  )
    .trim()
    .toLowerCase();

const statusMap = {
pending: "Pending",

accepted: "Accepted",

processing: "Processing",
preparing: "Processing",

shipped: "Shipped",
    "on the way": "Shipped",
on_the_way: "Shipped",

delivered: "Delivered",
  };

const currentStatus =
statusMap[normalizedStatus] || "Pending";

const currentStep =
steps.indexOf(currentStatus);

  // =====================================================
  // RATING
  // =====================================================

const submitRating = async () => {
if (rating === 0) {
toast.error("Please select a rating");
return;
    }

if (rated || ratingLoading) {
return;
    }

try {
setRatingLoading(true);

const token =
localStorage.getItem("token");

const response = await fetch(
        `${API_URL}/api/orders/${id}/rating`,
        {
method: "PUT",

headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
Authorization: `Bearer ${token}`,
                }
              : {}),
          },

body: JSON.stringify({
rating,
          }),
        }
      );

let data = {};

try {
data = await response.json();
      } catch {
data = {};
      }

if (!response.ok) {
throw new Error(
data.message ||
            "Failed to submit rating"
        );
      }

setRated(true);

toast.success(
        "Thank you for your feedback"
      );
    } catch (error) {
console.error(
        "Rating Error:",
error
      );

toast.error(
error.message ||
          "Unable to submit rating"
      );
    } finally {
setRatingLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

return (
<motion.div
className="track-page"
initial={{
opacity: 0,
x: 60,
      }}
animate={{
opacity: 1,
x: 0,
      }}
exit={{
opacity: 0,
x: -60,
      }}
transition={{
duration: 0.45,
      }}
>
      {/* =================================================
TITLE
      ================================================= */}

<motion.h1
className="track-title"
initial={{
opacity: 0,
x: -40,
        }}
animate={{
opacity: 1,
x: 0,
        }}
transition={{
delay: 0.2,
duration: 0.5,
        }}
>
<FaBoxOpen className="track-icon" />

Track Order
</motion.h1>

      {/* =================================================
ORDER NUMBER
      ================================================= */}

<motion.h2
initial={{
opacity: 0,
x: -40,
        }}
animate={{
opacity: 1,
x: 0,
        }}
transition={{
delay: 0.25,
duration: 0.5,
        }}
>
Order #{order.id || id}
</motion.h2>


      {/* =================================================
PROGRESS
      ================================================= */}

<div className="progress-container">
        {steps.map((step, index) => (
<div
key={step}
className="progress-step"
>
<div
className={
index < currentStep
                  ? "circle completed"
                  : index === currentStep
                  ? "circle active"
                  : "circle"
              }
>
              {index < currentStep
                ? "✓"
                : index + 1}
</div>

<p>{step}</p>

            {index !==
steps.length - 1&& (
<div
className={
index < currentStep
                    ? "line completed"
                    : "line"
                }
              />
            )}
</div>
        ))}
</div>

      {/* =================================================
ORDER STATUS
      ================================================= */}

<div className="order-status-box">
<span>Status</span>

<strong>
          {currentStatus}
</strong>
</div>

      {/* =================================================
DELIVERED SUCCESS
      ================================================= */}

      {currentStatus === "Delivered" && (
<motion.div
className="success-box"
initial={{
opacity: 0,
scale: 0.8,
          }}
animate={{
opacity: 1,
scale: 1,
          }}
transition={{
duration: 0.5,
          }}
>
<FaCheckCircle className="success-icon" />

<h2>
Your Order Has Been Delivered
</h2>

<p>
Enjoy Your Order{" "}
<FaHeart className="heart-icon" />
</p>
</motion.div>
      )}

      {/* =================================================
RATING
      ================================================= */}

      {currentStatus === "Delivered" && (
<motion.div
className="rating-box"
initial={{
opacity: 0,
y: 25,
          }}
animate={{
opacity: 1,
y: 0,
          }}
transition={{
duration: 0.5,
delay: 0.15,
          }}
>
          {!rated ? (
<>
<h2>
⭐Rate Your Order
</h2>

<p className="rating-message">
How was your shopping
experience?
</p>

<div className="stars">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
<span
key={star}
onClick={() =>
                        !ratingLoading&&
setRating(star)
                      }
className={
rating >= star
                          ? "active-star"
                          : ""
                      }
>
⭐
</span>
                  )
                )}
</div>

<button
className="rate-btn"
onClick={submitRating}
disabled={ratingLoading}
>
                {ratingLoading
                  ? "Submitting..."
                  : "Submit Rating"}
</button>
</>
          ) : (
<div className="thank-you">
<h1>
<FaHeart className="heart-icon" />
</h1>

<h2>
Thank You!
</h2>

<p>
We Appreciate Your
Feedback <FaHeart className="heart-icon"/>
</p>

<div className="stars-fixed">
                {"⭐".repeat(rating)}
</div>
</div>
          )}
</motion.div>
      )}

      {/* =================================================
BUTTONS
      ================================================= */}

<div className="track-buttons">
<Link to="/">
<button className="home-btn">
Back To Home
</button>
</Link>

<Link to="/products">
<button className="shop-track-btn">
Continue Shopping
</button>
</Link>
</div>
</motion.div>
  );
}

export default TrackOrder;

