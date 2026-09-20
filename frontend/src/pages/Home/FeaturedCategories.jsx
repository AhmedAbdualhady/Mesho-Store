import "./FeaturedCategories.css";
import { motion } from "framer-motion";
import { FaBoxOpen } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


function FeaturedCategories() {
const navigate = useNavigate();

const [products, setProducts] = useState([]);


  // ==========================================
  // IMAGE URL
  // ==========================================

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
  // FETCH PRODUCTS
  // ==========================================

useEffect(() => {
const fetchProducts = async () => {
try {
const response = await fetch(
          `${API_URL}/api/products`
        );

const data = await response.json();

if (!response.ok) {
throw new Error(
data.message || "Failed to load products"
          );
        }

setProducts(
Array.isArray(data.products)
            ? data.products
            : []
        );
      } catch (error) {
console.error(
          "Featured categories error:",
error
        );
      } 
    };

fetchProducts();
  }, []);

  // ==========================================
  // GET CATEGORIES
  // ==========================================

const categories = useMemo(() => {

const featuredCategoryProducts =
products.filter(
      (product) =>
Number(product.featured_category) === 1
    );

const categoryNames = [
    ...new Set(
featuredCategoryProducts
        .map((product) =>
String(product.category || "").trim()
        )
        .filter(Boolean)
    ),
  ];

return categoryNames
    .map((name) => {

const categoryProduct =
featuredCategoryProducts.find(
          (product) =>
String(product.category || "")
              .trim()
              .toLowerCase() ===
name.toLowerCase() &&
product.image
        );

return {
name,

image: categoryProduct
          ? getImageUrl(categoryProduct)
          : "/placeholder.png",
      };

    })
    .slice(0, 4);

}, [products]);


  // ==========================================
  // CATEGORY COUNT
  // ==========================================

const getCategoryCount = (categoryName) => {
return products.filter(
      (product) =>
String(product.category || "")
          .trim()
          .toLowerCase() ===
categoryName.trim().toLowerCase()
    ).length;
  };


return (
<section className="featured-categories-section">

<div className="featured-categories-header">
<div>
<span className="featured-categories-label">
EXPLORE MESHOSTORE
</span>

<h2 className="featured-categories-title">
Featured Categories
</h2>
</div>

<button
className="view-all-categories"
onClick={() => navigate("/categories")}
>
View All →
</button>
</div>

<div className="featured-categories-grid">

        {categories.map((category, index) => (

<motion.div
key={category.name}
className="featured-category-card"

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
duration: 0.55,
delay: index * 0.1,
            }}

whileHover={{
y: -10,
scale: 1.02,
            }}

whileTap={{
scale: 0.97,
            }}

onClick={() =>
navigate(
                `/products?category=${encodeURIComponent(
category.name
                )}`
              )
            }
>

<div className="featured-category-image">

<img
src={category.image}
alt={category.name}
              />

<div className="featured-category-overlay">
<span>
Explore →
</span>
</div>

</div>

<div className="featured-category-info">

<div className="featured-category-icon">
<FaBoxOpen />
</div>

<div>
<h3>
                  {category.name}
</h3>

<p>
                  {getCategoryCount(category.name)}{" "}
                  {getCategoryCount(category.name) === 1
                    ? "Product"
                    : "Products"}
</p>
</div>

</div>

</motion.div>

        ))}

</div>

</section>
  );
}

export default FeaturedCategories;

