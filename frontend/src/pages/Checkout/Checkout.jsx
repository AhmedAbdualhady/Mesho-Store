import "./Checkout.css";

import { useCart } from "../../context/CartContext";

import { useState, useEffect } from "react";

import {
  FaUniversity,
  FaMoneyBillWave,
  FaTruck,
  FaCamera,
  FaMobileAlt,
  FaStore,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import toast from "react-hot-toast";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


const PAYMENT_METHODS = [
  "bank",
  "wallet",
  "cash",
];


const SHIPPING_METHODS = [
  "pickup",
  "standard",
  "express",
];


function Checkout() {

  const navigate = useNavigate();

  const {
    cartItems,
    setCartItems,
  } = useCart();



const [shippingPrices, setShippingPrices] =
useState({
pickup: 0,
standard: 0,
express: 0,
  });




const [shippingTimes, setShippingTimes] =
useState({
standard: "",
express: "",
  });




const [paymentMethod, setPaymentMethod] =
useState(() => {
return (
localStorage.getItem(
        "checkoutPaymentMethod"
      ) || ""
    );
  });




const [shippingMethod, setShippingMethod] =
useState(() => {
return (
localStorage.getItem(
        "checkoutShippingMethod"
      ) || "pickup"
    );
  });









  const [paymentImage, setPaymentImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);


  const [paymentInfo, setPaymentInfo] =
    useState({});


  const [loading, setLoading] =
    useState(false);


  

const [checkingAuth, setCheckingAuth] =
useState(true);

const [orderCompleted, setOrderCompleted] =
useState(false);


const [customer, setCustomer] = useState(() => {
try {
return JSON.parse(
localStorage.getItem("checkoutCustomer")
    ) || {
name: "",
phone: "",
address: "",
city: "",
    };
  } catch {
return {
name: "",
phone: "",
address: "",
city: "",
    };
  }
});


// هنامباشرة
useEffect(() => {
localStorage.setItem(
    "checkoutCustomer",
JSON.stringify(customer)
  );
}, [customer]);


useEffect(() => {
localStorage.setItem(
    "checkoutPaymentMethod",
paymentMethod
  );

localStorage.setItem(
    "checkoutShippingMethod",
shippingMethod
  );
}, [
paymentMethod,
shippingMethod,
]);



  // =====================================================
  // AUTH CHECK
  // =====================================================

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    const user =
      localStorage.getItem("user");


    if (!token || !user) {

      toast.error(
        "Please login before checkout"
      );

      navigate("/login", {
        replace: true,
        state: {
          from: "/checkout",
        },
      });

      return;

    }


    try {

      JSON.parse(user);

      setCheckingAuth(false);

    } catch (error) {

      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");


      toast.error(
        "Please login again"
      );


      navigate("/login", {
        replace: true,
        state: {
          from: "/checkout",
        },
      });

    }

  }, [navigate]);


  // =====================================================
  // SCROLL
  // =====================================================

  useEffect(() => {

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

  }, []);


  // =====================================================
  // EMPTY CART CHECK
  // =====================================================

useEffect(() => {

if (
    !checkingAuth&&
    !orderCompleted&&
    (!cartItems || cartItems.length === 0)
  ) {

toast.error(
      "Your cart is empty"
    );

navigate("/products", {
replace: true,
    });

  }

}, [
checkingAuth,
orderCompleted,
cartItems,
navigate,
]);


  // =====================================================
  // PAYMENT SETTINGS
  // =====================================================

  useEffect(() => {

    if (checkingAuth) return;


    const fetchPaymentSettings =
      async () => {

        try {

          const response =
            await fetch(`${API_URL}/api/settings` );

          if (!response.ok) {

            throw new Error(
              "Failed to load payment settings"
            );

          }


          const data =
            await response.json();


          setPaymentInfo(
            data || {}
          );



setShippingPrices({
pickup: Number(
data.pickup_shipping_price ?? 0
  ),

standard: Number(
data.standard_shipping_price ?? 0
  ),

express: Number(
data.express_shipping_price ?? 0
  ),
});


setShippingTimes({
standard:
data.delivery_time || "",

express:
data.express_delivery_time || "",
});



        } catch (error) {

          console.error(
            "Payment Settings Error:",
            error
          );

        }

      };


    fetchPaymentSettings();

  }, [checkingAuth]);


  // =====================================================
  // CLEAN PREVIEW URL
  // =====================================================

  useEffect(() => {

    return () => {

      if (preview) {

        URL.revokeObjectURL(
          preview
        );

      }

    };

  }, [preview]);


  // =====================================================
  // CUSTOMER CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setCustomer(prev => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // TOTALS
  // =====================================================

  const subtotal =
    (cartItems || []).reduce(
      (sum, item) => {

        const price =
          Number(item.price);

        const quantity =
          Number(item.quantity);


        if (
          !Number.isFinite(price) ||
          !Number.isFinite(quantity)
        ) {

          return sum;

        }


        return (
          sum +
          price * quantity
        );

      },
      0
    );
    
    
const shipping =
shippingPrices[shippingMethod] ?? 0;


  const total =
    subtotal + shipping;


  // =====================================================
  // PAYMENT IMAGE
  // =====================================================

  const handlePaymentImage = (e) => {

    const file =
      e.target.files?.[0];


    if (!file) return;


    // -----------------------------------------------
    // IMAGE TYPE
    // -----------------------------------------------

    if (
      !file.type.startsWith("image/")
    ) {

      toast.error(
        "Please select a valid image"
      );

      e.target.value = "";

      return;

    }


    // -----------------------------------------------
    // FILE SIZE
    // -----------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      toast.error(
        "Image must be less than 5MB"
      );

      e.target.value = "";

      return;

    }


    // -----------------------------------------------
    // REMOVE OLD PREVIEW
    // -----------------------------------------------

    if (preview) {

      URL.revokeObjectURL(
        preview
      );

    }


    const imageUrl =
      URL.createObjectURL(file);


    setPaymentImage(file);

    setPreview(imageUrl);

  };


  // =====================================================
  // COPY PAYMENT INFO
  // =====================================================

  const copyText = async (text) => {

    if (!text) {

      toast.error(
        "Nothing to copy"
      );

      return;

    }


    try {

      await navigator.clipboard.writeText(
        String(text)
      );

      toast.success(
        "Copied!"
      );

    } catch (error) {

      console.error(
        "Copy error:",
        error
      );

      toast.error(
        "Unable to copy"
      );

    }

  };


  // =====================================================
  // VALIDATE CUSTOMER
  // =====================================================

  const validateCustomer = () => {

    const name =
      customer.name.trim();

    const phone =
      customer.phone.trim();

    const address =
      customer.address.trim();

    const city =
      customer.city.trim();


    if (
      name.length < 2 ||
      name.length > 100
    ) {

      toast.error(
        "Please enter a valid name"
      );

      return false;

    }


    if (
      phone.length < 8 ||
      phone.length > 30
    ) {

      toast.error(
        "Please enter a valid phone number"
      );

      return false;

    }


    if (
      address.length < 3 ||
      address.length > 400
    ) {

      toast.error(
        "Please enter a valid address"
      );

      return false;

    }


    if (
      city.length < 2 ||
      city.length > 100
    ) {

      toast.error(
        "Please enter a valid city"
      );

      return false;

    }


    return true;

  };


  // =====================================================
  // VALIDATE CART
  // =====================================================

  const prepareItems = () => {

    if (
      !Array.isArray(cartItems) ||
      cartItems.length === 0
    ) {

      toast.error(
        "Your cart is empty"
      );

      return null;

    }


    const items =
      cartItems.map(item => ({

        product_id:
          Number(item.id),

        quantity:
          Number(item.quantity),

      }));


    const invalidItem =
      items.some(item =>

        !Number.isInteger(
          item.product_id
        ) ||

        item.product_id <= 0 ||

        !Number.isInteger(
          item.quantity
        ) ||

        item.quantity <= 0

      );


    if (invalidItem) {

      toast.error(
        "Invalid cart items"
      );

      return null;

    }


    return items;

  };


  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handleOrder = async (e) => {

    e.preventDefault();


    if (loading) return;


    // =================================================
    // TOKEN
    // =================================================

    const token =
      localStorage.getItem("token");


    if (!token) {

      toast.error(
        "Please login before placing your order"
      );

      navigate("/login", {
        replace: true,
        state: {
          from: "/checkout",
        },
      });

      return;

    }


    // =================================================
    // CART
    // =================================================

    const items =
      prepareItems();


    if (!items) return;


    // =================================================
    // CUSTOMER
    // =================================================

    if (!validateCustomer()) {
      return;
    }


    // =================================================
    // PAYMENT METHOD
    // =================================================

    if (
      !PAYMENT_METHODS.includes(
        paymentMethod
      )
    ) {

      toast.error(
        "Please select a payment method"
      );

      return;

    }


    // =================================================
    // SHIPPING METHOD
    // =================================================

    if (
      !SHIPPING_METHODS.includes(
        shippingMethod
      )
    ) {

      toast.error(
        "Please select a valid shipping method"
      );

      return;

    }


    // =================================================
    // PAYMENT PROOF
    // =================================================

    const requiresPaymentProof =
      paymentMethod === "bank" ||
      paymentMethod === "wallet";


    if (
      requiresPaymentProof &&
      !paymentImage
    ) {

      toast.error(
        "Please upload your payment proof"
      );

      return;

    }


    try {

      setLoading(true);


      // =================================================
      // FORM DATA
      // =================================================

      const formData =
        new FormData();


      formData.append(
        "customer_name",
        customer.name.trim()
      );


      formData.append(
        "phone",
        customer.phone.trim()
      );


      formData.append(
        "address",
        `${customer.address.trim()}, ${customer.city.trim()}`
      );


      formData.append(
        "payment_method",
        paymentMethod
      );


      formData.append(
        "shipping_method",
        shippingMethod
      );


      formData.append(
        "items",
        JSON.stringify(items)
      );


      if (paymentImage) {

        formData.append(
          "paymentImage",
          paymentImage
        );

      }


      // =================================================
      // SEND ORDER
      // =================================================

      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          }
        );


      // =================================================
      // READ RESPONSE SAFELY
      // =================================================

      let data = {};

      try {

        data =
          await response.json();

      } catch {

        data = {};

      }


      // =================================================
      // AUTH ERROR
      // =================================================

      if (
        response.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );


        toast.error(
          "Your session expired. Please login again."
        );


        navigate("/login", {
          replace: true,
          state: {
            from: "/checkout",
          },
        });


        return;

      }


      // =================================================
      // FORBIDDEN
      // =================================================

      if (
        response.status === 403
      ) {

        toast.error(
          data.message ||
          "You are not allowed to place this order"
        );

        return;

      }


      // =================================================
      // STOCK CONFLICT
      // =================================================

      if (
        response.status === 409
      ) {

        toast.error(
          data.message ||
          "Some products are out of stock"
        );

        return;

      }


      // =================================================
      // PRODUCT NOT FOUND
      // =================================================

      if (
        response.status === 404
      ) {

        toast.error(
          data.message ||
          "A product was not found"
        );

        return;

      }


      // =================================================
      // VALIDATION ERROR
      // =================================================

      if (
        response.status === 400
      ) {

        toast.error(
          data.message ||
          "Please check your order information"
        );

        return;

      }


      // =================================================
      // OTHER ERROR
      // =================================================

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to place order"
        );

      }


      // =================================================
      // VERIFY SUCCESS RESPONSE
      // =================================================

      if (
        !data.success ||
        !data.orderId
      ) {

        throw new Error(
          "Order was not created correctly"
        );

      }



// =====================================================
// SUCCESS
// =====================================================

toast.success(
  "Order placed successfully!"
);

// IMPORTANT:
// Tell the empty-cart useEffect that
// the cart became empty because the order
// was successfully completed.
setOrderCompleted(true);

// Empty cart ONLY after successful order
setCartItems([]);

localStorage.removeItem("checkoutCustomer");
localStorage.removeItem("checkoutPaymentMethod");
localStorage.removeItem("checkoutShippingMethod");

// =====================================================
// GO TO SUCCESS PAGE
// =====================================================

localStorage.setItem(
  "lastOrder",
JSON.stringify({
orderId: data.orderId,
subtotal: data.subtotal,
shipping: data.shipping,
shipping_method: data.shipping_method,
total: data.total
  })
);

navigate(
  "/success",
  {
replace: true,

state: {
orderId:
data.orderId,

subtotal:
data.subtotal,

shipping:
data.shipping,

shipping_method:
data.shipping_method,

total:
data.total,
    },
  }
);


    } catch (error) {

      console.error(
        "Order Error:",
        error
      );


      toast.error(
        error.message ||
        "Failed to place order"
      );


    } finally {

      setLoading(false);

    }

  };



  // =====================================================
  // RENDER
  // =====================================================

  return (

<>


<motion.div
className="checkout-page"
initial={{
opacity: 0,
y: 50,
  }}
animate={{
opacity: 1,
y: 0,
  }}
exit={{
opacity: 0,
y: -30,
  }}
transition={{
duration: 0.55,
ease: "easeOut",
  }}
>

<motion.h1
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
Checkout
</motion.h1>



<form
          className="checkout-layout"
          onSubmit={handleOrder}
>


          {/* =================================================
              LEFT
          ================================================= */}

<div className="checkout-left">


            {/* =================================================
                CUSTOMER INFORMATION
            ================================================= */}

<div className="checkout-card">

<h2>
                Customer Information
</h2>


<input
                type="text"
                name="name"
                placeholder="Full Name"
                value={customer.name}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                required
              />


<input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={customer.phone}
                onChange={handleChange}
                minLength={8}
                maxLength={30}
                autoComplete="tel"
                required
              />


<input
                type="text"
                name="address"
                placeholder="Address"
                value={customer.address}
                onChange={handleChange}
                maxLength={400}
                autoComplete="street-address"
                required
              />


<input
                type="text"
                name="city"
                placeholder="City"
                value={customer.city}
                onChange={handleChange}
                maxLength={100}
                autoComplete="address-level2"
                required
              />

</div>


            {/* =================================================
                SHIPPING
            ================================================= */}

<div className="checkout-card">

<h2>
                Shipping Method
</h2>


<div className="shipping-options">


                {/* PICKUP */}

<button
                  type="button"
                  className={
                    `shipping-card ${
                      shippingMethod === "pickup"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setShippingMethod(
                      "pickup"
                    )
                  }
>

<FaStore />

<h3>
                    Pickup From Store
</h3>

<p>
                    Collect your order
                    from our store
</p>


<span>
  {shippingPrices.pickup === 0
    ? "FREE"
    : `$${shippingPrices.pickup.toFixed(2)}`
  }
</span>


</button>


                {/* STANDARD */}

<button
                  type="button"
                  className={
                    `shipping-card ${
                      shippingMethod === "standard"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setShippingMethod(
                      "standard"
                    )
                  }
>

<FaTruck />

<h3>
                    Standard Shipping
</h3>



<p>
  {shippingTimes.standard}
</p>

<span>
  ${shippingPrices.standard.toFixed(2)}
</span>




</button>


                {/* EXPRESS */}

<button
                  type="button"
                  className={
                    `shipping-card ${
                      shippingMethod === "express"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setShippingMethod(
                      "express"
                    )
                  }
>

<FaTruck />

<h3>
                    Express Shipping
</h3>


<p>
  {shippingTimes.express}
</p>

<span>
  ${shippingPrices.express.toFixed(2)}
</span>


</button>


</div>

</div>


            {/* =================================================
                PAYMENT
            ================================================= */}

<div className="checkout-card">

<h2>
                Payment Method
</h2>


<div className="payment-options">



                {/* BANK */}

<button
                  type="button"
                  className={
                    `payment-card ${
                      paymentMethod === "bank"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setPaymentMethod("bank")
                  }
>

<FaUniversity />

<span>
                    Bank Transfer
</span>

</button>


                {/* WALLET */}

<button
                  type="button"
                  className={
                    `payment-card ${
                      paymentMethod === "wallet"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setPaymentMethod("wallet")
                  }
>

<FaMobileAlt />

<span>
                    Mobile Wallet
</span>

</button>


                {/* CASH */}

<button
                  type="button"
                  className={
                    `payment-card ${
                      paymentMethod === "cash"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setPaymentMethod("cash")
                  }
>

<FaMoneyBillWave />

<span>
                    Cash On Delivery
</span>

</button>


</div>


              {/* =================================================
                  BANK INFO
              ================================================= */}

              {paymentMethod === "bank" && (

<div className="payment-info">

<h4>
                    Bank Transfer
</h4>


<p>
<strong>
                      Bank:
</strong>{" "}
                    {paymentInfo.bank_name ||
                      "Not available"}
</p>


<p>
<strong>
                      Name:
</strong>{" "}
                    {paymentInfo.account_name ||
                      "Not available"}
</p>


<p>
<strong>
                      Account:
</strong>{" "}
                    {paymentInfo.account_number ||
                      "Not available"}
</p>


<button
                    type="button"
                    onClick={() =>
                      copyText(
                        paymentInfo.account_number
                      )
                    }
>
                    Copy Account Number
</button>

</div>

              )}


              {/* =================================================
                  WALLET INFO
              ================================================= */}

              {paymentMethod === "wallet" && (

<div className="payment-info">

<h4>
                    Mobile Wallet
</h4>


<p>
<strong>
                      Wallet:
</strong>{" "}
                    {paymentInfo.wallet_name ||
                      "Not available"}
</p>


<p>
<strong>
                      Number:
</strong>{" "}
                    {paymentInfo.wallet_number ||
                      "Not available"}
</p>


<button
                    type="button"
                    onClick={() =>
                      copyText(
                        paymentInfo.wallet_number
                      )
                    }
>
                    Copy Number
</button>

</div>

              )}


              {/* =================================================
                  CASH
              ================================================= */}

              {paymentMethod === "cash" && (

<div className="payment-info">

<h4>
                    Cash On Delivery
</h4>

<p>
                    Pay when your order
                    arrives.
</p>

</div>

              )}



              {/* =================================================
                  PAYMENT IMAGE
              ================================================= */}

              {
                (
                  paymentMethod === "bank" ||
                  paymentMethod === "wallet"
                ) && (

<>

<label className="upload-box">

<FaCamera
                        className="upload-icon"
                      />

<span>
                        Upload Payment Screenshot
</span>

<small>
                        JPG, PNG or WEBP • Max 5MB
</small>


<input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={
                          handlePaymentImage
                        }
                      />

</label>


                    {paymentImage && (

<div className="file-name">

                        {paymentImage.name}

</div>

                    )}


                    {preview && (

<div className="image-preview">

<img
                          src={preview}
                          alt="Payment Preview"
                        />

</div>

                    )}

</>

                )
              }


</div>


</div>


          {/* =================================================
              RIGHT - SUMMARY
          ================================================= */}

<div className="checkout-right">

<div className="summary-card">

<h2>
                Order Summary
</h2>


              {cartItems.map(item => (

<div
                  key={item.id}
                  className="summary-item"
>

<img
                    src={
                      item.image?.startsWith("http")
                        ? item.image
                        : `${API_URL}/uploads/${item.image}`
                    }
                    alt={item.name}
                  />


<div>
<h4>
    {item.name}
</h4>

<p>
Qty:{" "}
    {item.quantity}
</p>
</div>

<span>
  $
  {(
Number(item.price || 0) *
Number(item.quantity || 0)
  ).toFixed(2)}
</span>

</div>

              ))}


<hr />


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

                  {shipping === 0
                    ? "FREE"
                    : `$${shipping.toFixed(2)}`
                  }

</span>

</div>


<div className="summary-shipping-method">

                {shippingMethod === "pickup"
                  ? "🏪 Store Pickup"
                  : shippingMethod === "standard"
                  ? "🚚 Standard Shipping"
                  : "⚡ Express Shipping"
                }

</div>


<div className="summary-total">

<span>
                  Total
</span>

<span>
                  ${total.toFixed(2)}
</span>

</div>


<button
                className="confirm-btn"
                type="submit"
                disabled={loading}
>

                {loading
                  ? "Placing Order..."
                  : "Confirm Order"
                }

</button>


<p className="secure-checkout">
🔒 Your order is securely processed
</p>

</div>

</div>

</form>

</motion.div>

</>

  );

}


export default Checkout;

