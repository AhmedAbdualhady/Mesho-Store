import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { Toaster } from "react-hot-toast";

import "./index.css";

import App from "./App";

import { CartProvider } from "./context/CartContext";

import { WishlistProvider } from "./context/WishlistContext";


createRoot(document.getElementById("root")).render(

<StrictMode>

<WishlistProvider>

<CartProvider>

<App />

<Toaster
position="top-right"
toastOptions={{
duration: 2500,
  }}
containerStyle={{
top: "95px",
  }}
/>

</CartProvider>

</WishlistProvider>

</StrictMode>


);
