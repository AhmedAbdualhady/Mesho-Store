import "./Success.css";

import { useLocation, useNavigate } from "react-router-dom";

import { useEffect } from "react";

import { motion } from "framer-motion";

import {
FaCheckCircle,
FaShoppingBag,
FaHome,
FaReceipt,
FaTruck,
FaFileInvoice,
} from "react-icons/fa";

import jsPDF from "jspdf";

function Success() {

const navigate = useNavigate();
const location = useLocation();


useEffect(() => {
window.scrollTo({
top: 0,
behavior: "auto"
  });
}, []);



  // =====================================================
  // ORDER DATA
  // =====================================================

const savedOrder = JSON.parse(
localStorage.getItem("lastOrder") || "null"
);

const orderData = location.state || savedOrder || {};

const orderId = orderData.orderId || null;

const subtotal =
Number(orderData.subtotal || 0);

const shipping =
Number(orderData.shipping || 0);

const shippingMethod =
orderData.shipping_method || "pickup";

const total =
Number(
orderData.total ??
subtotal + shipping
    );


  // =====================================================
  // DOWNLOAD INVOICE
  // =====================================================

const downloadInvoice = () => {

const doc = new jsPDF();


    // ===================================================
    // HEADER
    // ===================================================

doc.setFontSize(22);

doc.setFont("helvetica", "bold");

doc.text(
      "MeshoStore Invoice",
      20,
      30
    );


doc.setFontSize(12);

doc.setFont("helvetica", "normal");


    // ===================================================
    // ORDER INFO
    // ===================================================

doc.text(
      `Order #${orderId ?? "----"}`,
      20,
      48
    );


doc.text(
      `Shipping Method: ${shippingMethod}`,
      20,
      60
    );


    // ===================================================
    // LINE
    // ===================================================

doc.line(
      20,
      70,
      190,
      70
    );


    // ===================================================
    // ORDER SUMMARY
    // ===================================================

doc.setFontSize(14);

doc.setFont(
      "helvetica",
      "bold"
    );

doc.text(
      "Order Summary",
      20,
      85
    );


doc.setFontSize(12);

doc.setFont(
      "helvetica",
      "normal"
    );


doc.text(
      `Subtotal: $${subtotal.toFixed(2)}`,
      20,
      100
    );


doc.text(
      `Shipping: ${
shipping === 0
          ? "FREE"
          : `$${shipping.toFixed(2)}`
      }`,
      20,
      112
    );


doc.text(
      `Shipping Method: ${shippingMethod}`,
      20,
      124
    );


    // ===================================================
    // TOTAL
    // ===================================================

doc.setFontSize(15);

doc.setFont(
      "helvetica",
      "bold"
    );

doc.text(
      `Total: $${total.toFixed(2)}`,
      20,
      145
    );


    // ===================================================
    // FOOTER
    // ===================================================

doc.setFontSize(11);

doc.setFont(
      "helvetica",
      "normal"
    );

doc.text(
      "Thank you for shopping with MeshoStore!",
      20,
      170
    );


doc.text(
      "Your order has been confirmed successfully.",
      20,
      182
    );


    // ===================================================
    // SAVE
    // ===================================================

doc.save(
      `MeshoStore-Invoice-${orderId ?? "Order"}.pdf`
    );

  };


  // =====================================================
  // CONTINUE SHOPPING
  // =====================================================


const handleContinueShopping = () => {
navigate("/products");
};



  // =====================================================
  // BACK HOME
  // =====================================================

const handleBackHome = () => {
navigate("/");
};


  // =====================================================
  // TRACK ORDER
  // =====================================================

const handleTrackOrder = () => {

if (!orderId) {
return;
  }

navigate(`/track/${orderId}`);

};


  // =====================================================
  // RENDER
  // =====================================================

return (

<>

<motion.section

className="success-page"

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



<motion.div
className="success-card"

initial={{
scale: 0.85,
opacity: 0,
          }}

animate={{
scale: 1,
opacity: 1,
          }}

transition={{
duration: 0.45,
delay: 0.1,
          }}
>


          {/* ===========================================
SUCCESS ICON
          =========================================== */}

<div className="success-icon">

<FaCheckCircle />

</div>


          {/* ===========================================
TITLE
          =========================================== */}

<motion.h1

initial={{
opacity: 0,
x: -30,
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

Order Placed Successfully

</motion.h1>


          {/* ===========================================
MESSAGE
          =========================================== */}

<motion.p

initial={{
opacity: 0,
x: -30,
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

Thank you for your order!
<br />

Your order has been received
successfully.

</motion.p>


          {/* ===========================================
ORDER NUMBER
          =========================================== */}

<motion.div
className="order-number"

initial={{
opacity: 0,
y: 15,
            }}

animate={{
opacity: 1,
y: 0,
            }}

transition={{
delay: 0.35,
duration: 0.45,
            }}
>

<FaReceipt />

<span>
Order #
</span>

<strong>
              {orderId ?? "----"}
</strong>

</motion.div>


          {/* ===========================================
ORDER SUMMARY
          =========================================== */}

          {orderId&& (

<div className="success-summary">

<div className="success-summary-row">

<span>
Subtotal
</span>

<strong>
                  ${subtotal.toFixed(2)}
</strong>

</div>


<div className="success-summary-row">

<span>
Shipping
</span>

<strong>

                  {shipping === 0
                    ? "FREE"
                    : `$${shipping.toFixed(2)}`
                  }

</strong>

</div>


<div className="success-summary-row">

<span>
Shipping Method
</span>

<strong>

                  {shippingMethod === "pickup"
                    ? "🏪Pickup"
                    : shippingMethod === "express"
                    ? "⚡Express"
                    : "🚚Standard"
                  }

</strong>

</div>


<div className="success-total-row">

<span>
Total
</span>

<strong>
                  ${total.toFixed(2)}
</strong>

</div>

</div>

          )}


          {/* ===========================================
BUTTONS
          =========================================== */}

<div className="success-buttons">


            {/* CONTINUE SHOPPING */}

<button
type="button"

className="success-btn continue-shopping-btn"

onClick={
handleContinueShopping
              }
>

<FaShoppingBag />

<span>
Continue Shopping
</span>

</button>


            {/* BACK HOME */}

<button
type="button"

className="success-btn back-home-btn"

onClick={
handleBackHome
              }
>

<FaHome />

<span>
Back Home
</span>

</button>


            {/* TRACK ORDER */}



<button
type="button"
className="success-btn track-order-btn"
onClick={handleTrackOrder}
disabled={!orderId}
>

<FaTruck />
<span>
Track Order
</span>
</button>

            {/* DOWNLOAD INVOICE */}

<button
type="button"

className="success-btn invoice-btn"

onClick={
downloadInvoice
              }

disabled={!orderId}
>

<FaFileInvoice />

<span>
Download Invoice
</span>

</button>


</div>


          {/* ===========================================
SECURITY MESSAGE
          =========================================== */}

<div className="success-footer">

<span>
🔒
</span>

<span>
Your order has been securely recorded.
</span>

</div>


</motion.div>

</motion.section>

</>

  );

}


export default Success;

