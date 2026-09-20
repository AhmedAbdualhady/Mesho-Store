import "./Home.css";

import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import {
useEffect,
useState,
} from "react";


import FeaturedCategories from "./FeaturedCategories";
import FeaturedProducts from "../../components/FeaturedProducts/FeaturedProducts";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


function Home({ setFlyItem }) {

const navigate = useNavigate();

const [products, setProducts] = useState([]);
const [settings, setSettings] = useState({});

const [loading, setLoading] = useState(true);



useEffect(() => {

const loadHomeData = async () => {

try {

setLoading(true);

const [
settingsResponse,
productsResponse
      ] = await Promise.all([

fetch(`${API_URL}/api/settings`),

fetch(`${API_URL}/api/products`)

      ]);

if (
        !settingsResponse.ok ||
        !productsResponse.ok
      ) {

throw new Error(
          "Failed to load home data"
        );

      }

const settingsData =
await settingsResponse.json();

const productsData =
await productsResponse.json();

setSettings(
settingsData || {}
      );

setProducts(
Array.isArray(
productsData.products
        )
          ? productsData.products
          : []
      );

    } catch (error) {

console.error(
        "Home data error:",
error
      );

    } finally {

setLoading(false);

    }

  };

loadHomeData();

}, []);





const heroProduct =
products.find(
      (product) =>
Number(product.hero) === 1
    );

const heroImage =
heroProduct?.image
      ? heroProduct.image.startsWith("http")
        ? heroProduct.image
        : `${API_URL}/uploads/${heroProduct.image}`

      : "/placeholder.png";


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


      {/* =========================
HERO
      ========================= */}

<section className="hero">

<motion.div
className="hero-text"

initial={{
opacity: 0,
x: -80
          }}

animate={{
opacity: 1,
x: 0
          }}

transition={{
duration: 0.8
          }}
>


<h1 className="hero-color">

  {settings.hero_title}

</h1>


<p>

  {
settings.hero_description
  }

</p>


          {/* =========================
HERO BUTTONS
          ========================= */}

<div className="hero-buttons">


<button
className="shop-btn"
onClick={() => navigate("/products")}
>

  {
settings.hero_button 
  }

</button>


<button
className="discover-btn"

onClick={() =>
navigate("/categories")
              }
>

Discover

</button>


</div>

</motion.div>


        {/* =========================
HERO IMAGE
        ========================= */}

<motion.div

className="hero-image"

initial={{
opacity: 0,
x: 80
          }}

animate={{
opacity: 1,
x: 0
          }}

transition={{
duration: 0.8
          }}

>

<img
src={heroImage}
alt={
heroProduct?.name ||
    "NovaStore"
  }
/>

</motion.div>


</section>





{
  (
settings.discount_title ||
settings.discount_description
  ) && (

<motion.section

className="discount-section"

initial={{
opacity: 0,
y: 40
      }}

whileInView={{
opacity: 1,
y: 0
      }}

viewport={{
once: true,
amount: 0.2
      }}

transition={{
duration: 0.6
      }}

>

<div className="discount-content">


<h2>

          {
settings.discount_title 
          }

</h2>


<p>

          {
settings.discount_description
          }

</p>


</div>

</motion.section>

  )
}








      {/* =========================
FEATURED CATEGORIES
      ========================= */}

<FeaturedCategories />


      {/* =========================
FEATURED PRODUCTS
      ========================= */}


<FeaturedProducts
setFlyItem={setFlyItem}
/>

</motion.div>

  );

}


export default Home;

