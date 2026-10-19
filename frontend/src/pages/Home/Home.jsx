import "./Home.css";

import { motion, animate, useMotionValue } from "framer-motion";

import { useNavigate } from "react-router-dom";

import {
useCallback,
useEffect,
useLayoutEffect,
useRef,
useState,
} from "react";

import FeaturedCategories from "./FeaturedCategories";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";

const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";

const INTRO_KEY = "mesho_hero_intro_played";

const readIntroSeen = () => {
try {
if (
window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
return true;
    }

return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
return false;
  }
};

const markIntroSeen = () => {
try {
sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
return;
  }
};

const sceneVariants = {
hidden: {
rotateX: 58,
rotateZ: -38,
scale: 0.8,
  },
build: {
rotateX: 58,
rotateZ: -26,
scale: 0.86,
transition: {
duration: 2.4,
ease: "linear",
    },
  },
close: {
rotateX: 0,
rotateZ: 0,
scale: 1,
transition: {
duration: 0.95,
ease: [0.76, 0, 0.24, 1],
    },
  },
};

const layerVariants = {
hidden: (i) => ({
opacity: 0,
z: i * 90 + 420,
  }),
build: (i) => ({
opacity: 1,
z: i * 90,
transition: {
delay: i * 0.38,
duration: 0.7,
ease: [0.22, 1, 0.36, 1],
    },
  }),
close: (i) => ({
opacity: 1,
z: i * 2,
transition: {
delay: (4 - i) * 0.06,
duration: 0.6,
ease: [0.76, 0, 0.24, 1],
    },
  }),
};

const EASE_OUT = [0.22, 1, 0.36, 1];

function Home({ setFlyItem }) {
const navigate = useNavigate();

const [products, setProducts] = useState([]);
const [settings, setSettings] = useState({});
const [loading, setLoading] = useState(true);

const [skip] = useState(readIntroSeen);
const [stage, setStage] = useState(
skip ? "done" : "wait"
  );
const [cursor, setCursor] = useState(null);
const [btnHit, setBtnHit] = useState(false);

const heroRef = useRef(null);
const colRef = useRef(null);
const phoneRef = useRef(null);
const btnRef = useRef(null);
const timersRef = useRef([]);

const phoneX = useMotionValue(0);
const phoneScale = useMotionValue(skip ? 1 : 1.15);

useEffect(() => {
const loadHomeData = async () => {
try {
setLoading(true);

const [settingsResponse, productsResponse] =
await Promise.all([
fetch(`${API_URL}/api/settings`),
fetch(`${API_URL}/api/products`),
          ]);

if (
          !settingsResponse.ok ||
          !productsResponse.ok
        ) {
throw new Error("Failed to load home data");
        }

const settingsData =
await settingsResponse.json();

const productsData =
await productsResponse.json();

setSettings(settingsData || {});

setProducts(
Array.isArray(productsData.products)
            ? productsData.products
            : []
        );
      } catch (error) {
console.error("Home data error:", error);
      } finally {
setLoading(false);
      }
    };

loadHomeData();
  }, []);

useLayoutEffect(() => {
if (loading || skip) return;

const hero = heroRef.current;
const col = colRef.current;

if (!hero || !col) return;

const h = hero.getBoundingClientRect();
const c = col.getBoundingClientRect();

phoneX.set(
h.left + h.width / 2 - (c.left + c.width / 2)
    );
  }, [loading, skip, phoneX]);

useEffect(() => {
if (loading || skip) return;

markIntroSeen();

const at = (ms, fn) => {
timersRef.current.push(setTimeout(fn, ms));
    };

setStage("build");

at(2300, () => setStage("close"));
at(3300, () => setStage("move"));
at(4600, () => setStage("point"));
at(6800, () => setStage("done"));

return () => {
timersRef.current.forEach(clearTimeout);
timersRef.current = [];
    };
  }, [loading, skip]);

useEffect(() => {
if (stage !== "move") return;

const options = {
duration: 1.1,
ease: EASE_OUT,
    };

const moveX = animate(phoneX, 0, options);
const moveScale = animate(phoneScale, 1, options);

return () => {
moveX.stop();
moveScale.stop();
phoneX.set(0);
phoneScale.set(1);
    };
  }, [stage, phoneX, phoneScale]);

useEffect(() => {
if (stage !== "point") return;

const hero = heroRef.current;
const btn = btnRef.current;
const phone = phoneRef.current;

if (!hero || !btn || !phone) return;

const b = btn.getBoundingClientRect();

if (b.bottom > window.innerHeight - 24) {
window.scrollBy({
top: b.bottom - window.innerHeight + 90,
behavior: "smooth",
      });
    }

const h = hero.getBoundingClientRect();
const p = phone.getBoundingClientRect();

setCursor({
sx: p.left + p.width / 2 - h.left,
sy: p.top + p.height * 0.6 - h.top,
ex: b.left + b.width * 0.62 - h.left,
ey: b.top + b.height * 0.55 - h.top,
    });

const hitTimer = setTimeout(
      () =>setBtnHit(true),
      1250
    );

const endTimer = setTimeout(() => {
setCursor(null);
setBtnHit(false);
    }, 1900);

return () => {
clearTimeout(hitTimer);
clearTimeout(endTimer);
    };
  }, [stage]);

const skipIntro = useCallback(() => {
timersRef.current.forEach(clearTimeout);
timersRef.current = [];

phoneX.set(0);
phoneScale.set(1);

setCursor(null);
setBtnHit(false);
setStage("done");
markIntroSeen();
  }, [phoneX, phoneScale]);

const heroProduct = products.find(
(product) => Number(product.hero) === 1
  );

const heroImage = heroProduct?.image
    ? heroProduct.image.startsWith("http")
      ? heroProduct.image
      : `${API_URL}/uploads/${heroProduct.image}`
    : "/placeholder.png";

const textIn =
stage === "move" ||
stage === "point" ||
stage === "done";

const sceneState =
stage === "wait"
      ? "hidden"
      : stage === "build"
        ? "build"
        : "close";

const introRunning =
stage === "build" ||
stage === "close" ||
stage === "move" ||
stage === "point";

const glassPlays =
stage === "close" ||
stage === "move" ||
stage === "point";

const storeName =
settings.restaurant_name || "NovaStore";

if (loading) {
return (
<div className="loading-screen">
<div className="loader"></div>

<h2>Loading...</h2>
</div>
    );
  }

return (
<motion.div
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
<section className="hero" ref={heroRef}>
<motion.div
className="hero-text"
initial={
skip ? false : { opacity: 0, x: -70 }
          }
animate={
textIn
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: -70 }
          }
transition={{
duration: 0.9,
ease: EASE_OUT,
          }}
>
<h1 className="hero-color">
            {settings.hero_title}
</h1>

<p>{settings.hero_description}</p>

<div className="hero-buttons">
<button
ref={btnRef}
className={
btnHit
                  ? "shop-btn shop-btn-hit"
                  : "shop-btn"
              }
onClick={() => navigate("/products")}
>
              {settings.hero_button}
</button>

<button
className="discover-btn"
onClick={() => navigate("/categories")}
>
Discover
</button>
</div>
</motion.div>

<div className="hero-image" ref={colRef}>
<motion.div
className="phone-motion"
ref={phoneRef}
style={{
x: phoneX,
scale: phoneScale,
            }}
>
<div
className={
stage === "done"
                  ? "phone-float on"
                  : "phone-float"
              }
>
<div className="phone-stage">
<motion.div
className={
glassPlays
                      ? "phone-3d glass-play"
                      : "phone-3d"
                  }
variants={sceneVariants}
initial={skip ? false : "hidden"}
animate={sceneState}
>
<motion.div
className="ph-layer ph-body"
variants={layerVariants}
custom={0}
initial={skip ? false : "hidden"}
animate={sceneState}
>
<span className="ph-btn ph-btn-action" />
<span className="ph-btn ph-btn-up" />
<span className="ph-btn ph-btn-down" />
<span className="ph-btn ph-btn-power" />
<span className="ph-btn ph-btn-control" />
</motion.div>

<motion.div
className="ph-layer ph-inner"
variants={layerVariants}
custom={1}
initial={skip ? false : "hidden"}
animate={sceneState}
>
<div className="ph-battery">
<span className="ph-battery-tab" />
</div>
</motion.div>

<motion.div
className="ph-layer ph-board"
variants={layerVariants}
custom={2}
initial={skip ? false : "hidden"}
animate={sceneState}
>
<span className="ph-chip ph-chip-a" />
<span className="ph-chip ph-chip-b" />
<span className="ph-chip ph-chip-c" />
<span className="ph-chip ph-chip-d" />
</motion.div>

<motion.div
className="ph-layer ph-screen"
variants={layerVariants}
custom={3}
initial={skip ? false : "hidden"}
animate={sceneState}
>
<div className="ph-status">
<span>9:41</span>
<span className="ph-status-dots">
<i />
<i />
<i />
</span>
</div>

<div className="ph-clock">
<small>{storeName}</small>
<strong>9:41</strong>
</div>

<div className="ph-card">
<img
src={heroImage}
alt={
heroProduct?.name || storeName
                        }
                      />

<div>
<b>
                          {heroProduct?.name ||
storeName}
</b>

<span>
                          {heroProduct?.price
                            ? `$${Number(
heroProduct.price
                              ).toFixed(2)}`
                            : "Shop now"}
</span>
</div>
</div>
</motion.div>

<motion.div
className="ph-layer ph-glass"
variants={layerVariants}
custom={4}
initial={skip ? false : "hidden"}
animate={sceneState}
>
<span className="ph-island" />
<span className="ph-glare" />
</motion.div>
</motion.div>

<div
className={
stage === "wait" || stage === "build"
                      ? "phone-shadow"
                      : "phone-shadow on"
                  }
                />
</div>
</div>
</motion.div>
</div>

        {cursor&& (
<motion.div
className="intro-cursor"
initial={{
x: cursor.sx,
y: cursor.sy,
opacity: 0,
scale: 0.6,
            }}
animate={{
x: [cursor.sx, cursor.ex, cursor.ex, cursor.ex],
y: [cursor.sy, cursor.ey, cursor.ey, cursor.ey],
opacity: [0, 1, 1, 0],
scale: [0.6, 1, 0.8, 1],
            }}
transition={{
duration: 1.6,
times: [0, 0.55, 0.75, 1],
ease: "easeInOut",
            }}
>
<svg
width="30"
height="34"
viewBox="0 0 30 34"
aria-hidden="true"
>
<path
d="M3 2 L3 26 L9.5 20.5 L14 31 L19 29 L14.6 18.8 L23 18 Z"
fill="#ffffff"
stroke="#243b8f"
strokeWidth="2"
strokeLinejoin="round"
              />
</svg>
</motion.div>
        )}

        {introRunning&& (
<button
className="intro-skip"
onClick={skipIntro}
>
Skip
</button>
        )}
</section>

      {(settings.discount_title ||
settings.discount_description) && (
<motion.section
className="discount-section"
initial={{
opacity: 0,
y: 40,
          }}
whileInView={{
opacity: 1,
y: 0,
          }}
viewport={{
once: true,
amount: 0.2,
          }}
transition={{
duration: 0.6,
          }}
>
<div className="discount-content">
<h2>{settings.discount_title}</h2>

<p>{settings.discount_description}</p>
</div>
</motion.section>
      )}

<FeaturedCategories />

<FeaturedProducts setFlyItem={setFlyItem} />
</motion.div>
  );
}

export default Home;
