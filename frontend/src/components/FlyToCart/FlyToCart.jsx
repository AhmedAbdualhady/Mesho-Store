import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

function FlyToCart({
flyItem,
setFlyItem,
setCartShake,
}) {
const [animate, setAnimate] = useState(false);

useEffect(() => {
if (!flyItem) {
return;
    }

setAnimate(false);

const animationFrame = requestAnimationFrame(() => {
setAnimate(true);
    });

const timer = setTimeout(() => {
setAnimate(false);

setCartShake(true);

const shakeTimer = setTimeout(() => {
setCartShake(false);
      }, 450);

setFlyItem(null);

return () => {
clearTimeout(shakeTimer);
      };
    }, 900);

return () => {
cancelAnimationFrame(animationFrame);
clearTimeout(timer);
    };
  }, [
flyItem,
setFlyItem,
setCartShake,
  ]);

if (!flyItem) {
return null;
  }

const cart =
document.querySelector(".cart-icon");

if (!cart) {
return null;
  }

const cartRect =
cart.getBoundingClientRect();

const endX =
cartRect.left +
cartRect.width / 2;

const endY =
cartRect.top +
cartRect.height / 2;

const start = flyItem.rect;

return (
<AnimatePresence>

      {/* =====================================
GLOW TRAIL
      ===================================== */}

<motion.div
initial={{
opacity: 0.35,
scale: 1,
        }}

animate={
animate
            ? {
left: endX,
top: endY,
scale: 0.15,
opacity: 0,
              }
            : {}
        }

transition={{
duration: 0.8,
ease: "easeInOut",
        }}

style={{
position: "fixed",

left: start.left,
top: start.top,

width: start.width,
height: start.height,

borderRadius: "50%",

background:
            "rgba(255,80,150,.35)",

filter: "blur(30px)",

zIndex: 99998,

pointerEvents: "none",
        }}
      />


      {/* =====================================
FLYING PRODUCT IMAGE
      ===================================== */}

<motion.img
src={flyItem.image}
alt=""

initial={{
position: "fixed",

left: start.left,
top: start.top,

width: start.width,
height: start.height,

borderRadius: 20,

zIndex: 99999,
        }}

animate={
animate
            ? {
left: endX - 11,
top: endY - 11,

width: 22,
height: 22,

scale: 0.15,

rotate: 360,

opacity: 0.8,
              }
            : {}
        }

transition={{
duration: 0.8,

ease: "easeInOut",
        }}

style={{
pointerEvents: "none",

objectFit: "cover",

filter:
            "drop-shadow(0 0 20px #ff4fa3)",
        }}
      />


      {/* =====================================
CART IMPACT EFFECT
      ===================================== */}

      {animate&& (
<motion.div
initial={{
opacity: 0,
scale: 0.2,

left: endX,
top: endY,
          }}

animate={{
opacity: [0, 1, 0],
scale: [0.2, 2.2, 3],
          }}

transition={{
duration: 0.35,
delay: 0.72,
          }}

style={{
position: "fixed",

transform:
              "translate(-50%, -50%)",

width: 15,
height: 15,

borderRadius: "50%",

background: "#ffd700",

boxShadow: `
              0 0 25px #ffd700,
              0 0 45px #ff4fa3
            `,

zIndex: 99999,

pointerEvents: "none",
          }}
        />
      )}

</AnimatePresence>
  );
}

export default FlyToCart;

