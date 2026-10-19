import {
createContext,
useCallback,
useContext,
useEffect,
useMemo,
useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "cartItems";

const makeKey = (id, color, size) => `${id}|${color || ""}|${size || ""}`;

const readStorage = () => {
try {
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

if (!Array.isArray(saved)) return [];

return saved.map((item) => ({
      ...item,
color: item.color || null,
size: item.size || null,
cartKey: item.cartKey || makeKey(item.id, item.color, item.size),
    }));
  } catch {
return [];
  }
};

const pickProduct = (product) => ({
id: product.id,
name: product.name,
price: product.price,
old_price: product.old_price,
discount: product.discount,
image: product.image,
category: product.category,
stock: product.stock,
});

export function CartProvider({ children }) {
const [cartItems, setCartItems] = useState(readStorage);

useEffect(() => {
localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

const getProductQuantity = useCallback(
    (productId) =>
cartItems
        .filter((item) => Number(item.id) === Number(productId))
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

const addToCart = useCallback(
    (product, { color = null, size = null, quantity = 1 } = {}) => {
const stock = Number(product.stock) || 0;
const amount = Math.max(1, Number(quantity) || 1);

if (stock <= 0) {
return { ok: false, message: "This product is out of stock" };
      }

if (getProductQuantity(product.id) + amount > stock) {
return { ok: false, message: "You reached the available stock" };
      }

const cartKey = makeKey(product.id, color, size);

setCartItems((prev) => {
if (prev.some((item) => item.cartKey === cartKey)) {
return prev.map((item) =>
item.cartKey === cartKey
              ? { ...item, stock, quantity: Number(item.quantity || 0) + amount }
              : item
          );
        }

return [
          ...prev,
          { ...pickProduct(product), color, size, cartKey, quantity: amount },
        ];
      });

return { ok: true };
    },
    [getProductQuantity]
  );

const increaseItem = useCallback(
    (cartKey) => {
const item = cartItems.find((entry) => entry.cartKey === cartKey);

if (!item) return { ok: false };

if (getProductQuantity(item.id) >= Number(item.stock || 0)) {
return { ok: false, message: "You reached the available stock" };
      }

setCartItems((prev) =>
prev.map((entry) =>
entry.cartKey === cartKey
            ? { ...entry, quantity: Number(entry.quantity || 0) + 1 }
            : entry
        )
      );

return { ok: true };
    },
    [cartItems, getProductQuantity]
  );

const decreaseItem = useCallback((cartKey) => {
setCartItems((prev) =>
prev.map((entry) =>
entry.cartKey === cartKey
          ? { ...entry, quantity: Math.max(1, Number(entry.quantity || 1) - 1) }
          : entry
      )
    );
  }, []);

const removeItem = useCallback((cartKey) => {
setCartItems((prev) => prev.filter((entry) => entry.cartKey !== cartKey));
  }, []);

const cartCount = useMemo(
    () =>cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

const value = useMemo(
    () => ({
cartItems,
setCartItems,
cartCount,
getProductQuantity,
addToCart,
increaseItem,
decreaseItem,
removeItem,
    }),
    [
cartItems,
cartCount,
getProductQuantity,
addToCart,
increaseItem,
decreaseItem,
removeItem,
    ]
  );

return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
return useContext(CartContext);
}
