import "./Categories.css";

import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import {
FaMobileAlt,
FaLaptop,
FaTshirt,
FaHome,
FaShoePrints,
FaHeadphones,
FaBoxOpen,
} from "react-icons/fa";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


function Categories() {

const navigate = useNavigate();

useEffect(() => {
window.scrollTo({
top: 0,
behavior: "auto"
  });
}, []);


const [products, setProducts] = useState([]);

const [loading, setLoading] = useState(true);

const getImageUrl = (product) => {

if (!product?.image) {
return "/placeholder.png";
  }

if (product.image.startsWith("http")) {
return product.image;
  }

return `${API_URL}/uploads/${product.image}`;
};




  // ==========================================
  // STATIC CATEGORIES
  // ==========================================


const defaultCategories = [
  {
name: "Electronics",
icon: <FaMobileAlt />,
  },
  {
name: "Laptops",
icon: <FaLaptop />,
  },
  {
name: "Fashion",
icon: <FaTshirt />,
  },
  {
name: "Home",
icon: <FaHome />,
  },
  {
name: "Shoes",
icon: <FaShoePrints />,
  },
  {
name: "Accessories",
icon: <FaHeadphones />,
  },
];


useEffect(() => {

const fetchProducts = async () => {

try {

const response =
await fetch(
          `${API_URL}/api/products`
        );

const data =
await response.json();

if (!response.ok) {

throw new Error(
data.message ||
          "Failed to load products"
        );

      }

setProducts(
Array.isArray(data.products)
          ? data.products
          : []
      );

    } catch (error) {

console.error(
        "Categories products error:",
error
      );

    } finally {

setLoading(false);

    }

  };

fetchProducts();

}, []);


const dynamicCategories = useMemo(() => {

return [
    ...new Set(
products
        .map((product) =>
String(product.category || "").trim()
        )
        .filter(Boolean)
    ),
  ];

}, [products]);



  // ==========================================
  // MERGE STATIC + DYNAMIC
  // ==========================================


const categories = useMemo(() => {

const staticNames =
defaultCategories.map(
(category) =>category.name
    );


  // =====================================
  // الأصنافالقديمة + صورةمنمنتجاتها
  // =====================================

const staticCategoryObjects =
defaultCategories

      .filter((category) =>
dynamicCategories.some(
          (name) =>
name.toLowerCase() ===
category.name.toLowerCase()
        )
      )

      .map((category) => {

const categoryProduct =
products.find(
            (product) =>
String(product.category || "")
                .trim()
                .toLowerCase() ===
category.name.toLowerCase() &&
product.image
          );

return {

          ...category,

image: categoryProduct
            ? getImageUrl(categoryProduct)
            : "/placeholder.png",

        };

      });


  // =====================================
  // الأصنافالجديدة
  // =====================================

const extraCategories =
dynamicCategories.filter(
      (category) =>
        !staticNames.some(
          (name) =>
name.toLowerCase() ===
category.toLowerCase()
        )
    );


const extraCategoryObjects =
extraCategories.map((name) => {

const categoryProduct =
products.find(
          (product) =>
String(product.category || "")
              .trim()
              .toLowerCase() ===
name.toLowerCase() &&
product.image
        );

return {

name,

icon: <FaBoxOpen />,

image: categoryProduct
          ? getImageUrl(categoryProduct)
          : "/placeholder.png",

      };

    });


return [
    ...staticCategoryObjects,
    ...extraCategoryObjects,
  ];

}, [
products,
dynamicCategories,
]);





  // ==========================================
  // CATEGORY PRODUCTS COUNT
  // ==========================================

const getCategoryCount = (categoryName) => {

return products.filter(
      (product) =>
String(product.category || "")
          .toLowerCase()
          .trim() ===
categoryName.toLowerCase().trim()
    ).length;

  };


  // ==========================================
  // OPEN CATEGORY
  // ==========================================

const openCategory = (categoryName) => {

navigate(
      `/products?category=${encodeURIComponent(
categoryName
      )}`
    );

  };


return (

<motion.main
className="categories-page"

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

<div className="categories-header">

<span>
EXPLORE MESHOSTORE
</span>

<motion.h1
initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}>


Shop By Category

</motion.h1>


<p>
Find everything you need in our carefully
selected collections.
</p>

</div>


      {/* =====================================
LOADING
      ===================================== */}

      {loading ? (

<div className="categories-loading">

Loading categories...

</div>

      ) : (

<div className="categories-grid">

          {categories.map(
            (category, index) => (

<motion.div

key={category.name}

className="category-card"

initial={{
opacity: 0,
y: 35,
                }}

animate={{
opacity: 1,
y: 0,
                }}

transition={{
duration: 0.45,
delay: index * 0.08,
                }}

whileHover={{
y: -10,
scale: 1.02,
                }}

onClick={() =>
openCategory(
category.name
                  )
                }
>

<img
src={category.image}
alt={category.name}
                />


<div className="category-overlay">

<div className="category-icon">

                    {category.icon}

</div>


<h2>
                    {category.name}
</h2>


<span>

                    {getCategoryCount(
category.name
                    )}{" "}

                    {getCategoryCount(
category.name
                    ) === 1
                      ? "Product"
                      : "Products"}

                    {" →"}

</span>

</div>

</motion.div>

            )
          )}

</div>

      )}

</motion.main>

  );

}


export default Categories;
