import "./About.css";
import { motion } from "framer-motion";
import { FaAward, FaHeart, FaShieldAlt, FaTruck } from "react-icons/fa";
import { useEffect } from "react";


function About() {

useEffect(() => {
window.scrollTo({
top: 0,
behavior: "auto"
  });
}, []);


return (
<>

<motion.main
className="about-page"

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

<section className="about-hero">

<motion.div

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}

>

<span>ABOUT MESHOSTORE</span>

<h1>
Shopping Made
<strong> Simple.</strong>
</h1>

<p>
MeshoStore is built to make online shopping easier,
faster and more enjoyable.
</p>
</motion.div>

<motion.div
className="about-visual"
initial={{ scale: 0.85, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ duration: 0.6 }}
>
<FaHeart />
</motion.div>
</section>

<section className="about-story">
<span>OUR STORY</span>

<h2>More than just an online store.</h2>

<p>
MeshoStore was created with one simple idea: online shopping
should feel smooth, trustworthy and enjoyable. We bring
carefully selected products together with a clean shopping
experience designed around our customers.
</p>
</section>

<section className="about-features">
<div className="about-feature">
<FaShieldAlt />
<h3>Trusted Shopping</h3>
<p>We focus on creating a safe and reliable experience.</p>
</div>

<div className="about-feature">
<FaTruck />
<h3>Fast Delivery</h3>
<p>Simple shipping options designed around your needs.</p>
</div>

<div className="about-feature">
<FaAward />
<h3>Quality Products</h3>
<p>Products selected with quality and value in mind.</p>
</div>
</section>
</motion.main>
</>
  );
}

export default About;


