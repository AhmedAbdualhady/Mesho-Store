import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {

  // =========================================
  // LOAD WISHLIST
  // =========================================

const [wishlistItems, setWishlistItems] = useState(() => {

try {

const saved =
localStorage.getItem("wishlist");

if (!saved) {
return [];
      }

const parsed =
JSON.parse(saved);

if (!Array.isArray(parsed)) {
return [];
      }

      /*
       * IMPORTANT
       * If old wishlist data contains
       * complete product objects,
       * convert them to IDs.
       */

return parsed
        .map(item => {

if (
typeof item === "object" &&
item !== null
          ) {
return Number(item.id);
          }

return Number(item);

        })
        .filter(id => !Number.isNaN(id));

    } catch (error) {

console.error(
        "Wishlist storage error:",
error
      );

return [];

    }

  });


  // =========================================
  // TOGGLE WISHLIST
  // =========================================

const toggleWishlist = (product) => {

if (!product?.id) {
return;
    }

const productId =
Number(product.id);


setWishlistItems(prev => {

const exists =
prev.includes(productId);


if (exists) {

return prev.filter(
id => id !== productId
        );

      }


return [
        ...prev,
productId
      ];

    });

  };


  // =========================================
  // CHECK FAVORITE
  // =========================================

const isFavorite = (id) => {

return wishlistItems.includes(
Number(id)
    );

  };


  // =========================================
  // SAVE
  // =========================================

useEffect(() => {

localStorage.setItem(
      "wishlist",
JSON.stringify(wishlistItems)
    );

  }, [wishlistItems]);


  // =========================================
  // PROVIDER
  // =========================================

return (

<WishlistContext.Provider

value={{

wishlistItems,

toggleWishlist,

isFavorite,

      }}

>

      {children}

</WishlistContext.Provider>

  );

}


// =========================================
// HOOK
// =========================================

export const useWishlist = () =>
useContext(WishlistContext);

