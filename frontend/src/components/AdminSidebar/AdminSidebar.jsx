import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";
import {
FaChartPie,
FaBoxOpen,
FaCog,
FaShoppingCart,
} from "react-icons/fa";


import { motion } from "framer-motion";



function AdminSidebar() {

return (
<div className="admin-sidebar">


<motion.h2

className="logo-admin"

initial={{
opacity:0,
y:-20
}}

animate={{
opacity:1,
y:0
}}

transition={{
delay:.3,
duration:.5
}}

>



<FaShoppingCart className="logo-admin-icon"/>

Mesho

</motion.h2>


<NavLink
to="/admin/dashboard"
end
className="sidebar-link"
>


<FaChartPie className="sidebar-icon"/>

Dashboard

</NavLink>

<NavLink
to="/admin/products"
className="sidebar-link"
>
<FaBoxOpen className="sidebar-icon"/>

Products



</NavLink>



<NavLink
 to="/admin/settings"
 className="sidebar-link"
 >

<FaCog className="sidebar-icon"/>

Settings


</NavLink>


</div>
  );
}

export default AdminSidebar;

