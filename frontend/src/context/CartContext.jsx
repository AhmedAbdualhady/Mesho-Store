import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

const [cartItems, setCartItems] = useState(() => {
try {
return JSON.parse(localStorage.getItem("cartItems")) || [];
    } catch {
return [];
    }
  });


useEffect(() => {
localStorage.setItem(
      "cartItems",
JSON.stringify(cartItems)
    );
  }, [cartItems]);


return (
<CartContext.Provider
value={{
cartItems,
setCartItems
      }}
>
      {children}
</CartContext.Provider>
  );
}


export function useCart() {
return useContext(CartContext);
}
