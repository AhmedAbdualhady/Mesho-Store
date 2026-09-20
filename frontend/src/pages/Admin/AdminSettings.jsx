import { useEffect, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

import "./AdminSettings.css";

import {
FaStore,
FaBullhorn,
FaPercent,
FaPhoneAlt,
FaGlobe,
FaSave,
FaUniversity,
FaTruck,
} from "react-icons/fa";

import { MdOutlineAccountBalanceWallet } from "react-icons/md";

import { motion } from "framer-motion";

import toast from "react-hot-toast";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";



function AdminSettings() {

const token =
localStorage.getItem("token");


const [settings, setSettings] =
useState({

restaurant_name: "",

logo: "",
navbar_subtitle: "",

about: "",

phone: "",
email: "",
address: "",

facebook: "",
instagram: "",
whatsapp: "",

hero_title: "",
hero_description: "",
hero_button: "",

discount_title: "",
discount_description: "",

bank_name: "",
account_name: "",
account_number: "",

wallet_name: "",
wallet_number: "",

delivery_time: "",

pickup_shipping_price: 0,
standard_shipping_price: 15,
express_shipping_price: 30,
express_delivery_time: "1 - 2 Days",

    });


const [saving, setSaving] =
useState(false);

const [logoFile, setLogoFile] = useState(null);




  // =====================================================
  // GET SETTINGS
  // =====================================================

useEffect(() => {

const fetchSettings =
async () => {

try {

const response = await fetch(
  `${API_URL}/api/settings`
);


if (!response.ok) {

const errorData =
await response.json().catch(() => ({}));

throw new Error(
errorData.message ||
    "Failed to load settings"
  );

}


const data =
await response.json();


setSettings({

restaurant_name:
data.restaurant_name || "",

logo:
data.logo || "",

navbar_subtitle:
data.navbar_subtitle || "",

about:
data.about || "",

phone:
data.phone || "",

email:
data.email || "",

address:
data.address || "",

facebook:
data.facebook || "",

instagram:
data.instagram || "",

whatsapp:
data.whatsapp || "",

hero_title:
data.hero_title || "",

hero_description:
data.hero_description || "",

hero_button:
data.hero_button || "",

discount_title:
data.discount_title || "",

discount_description:
data.discount_description || "",

bank_name:
data.bank_name || "",

account_name:
data.account_name || "",

account_number:
data.account_number || "",

wallet_name:
data.wallet_name || "",

wallet_number:
data.wallet_number || "",

delivery_time:
data.delivery_time || "",


pickup_shipping_price:
Number(data.pickup_shipping_price ?? 0),

standard_shipping_price:
Number(data.standard_shipping_price ?? 15),

express_shipping_price:
Number(data.express_shipping_price ?? 30),

express_delivery_time:
data.express_delivery_time || "1 - 2 Days",


          });

        } catch (error) {

console.error(
            "Settings Error:",
error
          );

toast.error(
            "Failed to load settings"
          );

        } 

      };


fetchSettings();

  }, []);


  // =====================================================
  // HANDLE CHANGE
  // =====================================================

const handleChange = (e) => {

const {
name,
value,
    } = e.target;


setSettings((prev) => ({

      ...prev,

[name]: value,

    }));

  };


  // =====================================================
  // SAVE SETTINGS
  // =====================================================

const handleSubmit =
async (e) => {

e.preventDefault();


if (saving) return;


try {

setSaving(true);


const formData = new FormData();

Object.entries(settings).forEach(
  ([key, value]) => {

if (key !== "logo") {

formData.append(
key,
value || ""
      );

    }

  }
);


if (logoFile) {

formData.append(
    "logo",
logoFile
  );

}


const response =
await fetch(
  `${API_URL}/api/settings`,
  {
method: "PUT",

headers: {

Authorization:
        `Bearer ${token}`,

    },

body:
formData,

  }
);



const data =
await response.json();


if (!response.ok) {

throw new Error(
data.message ||
            "Failed to update settings"
          );

        }



toast.success(
  "Settings updated successfully!"
);

setLogoFile(null);

      } catch (error) {

console.error(
          "Update Settings Error:",
error
        );

toast.error(
error.message ||
          "Failed to update settings"
        );

      } finally {

setSaving(false);

      }

    };



  // =====================================================
  // RENDER
  // =====================================================

return (

<div className="admin-setting-products">

<AdminSidebar />


<motion.main

className="admin-setting-content"

initial={{
opacity: 0,
y: 40,
        }}

animate={{
opacity: 1,
y: 0,
        }}

transition={{
duration: 0.6,
        }}

>

<motion.h1

initial={{
opacity: 0,
x: -30,
          }}

animate={{
opacity: 1,
x: 0,
          }}

transition={{
delay: 0.2,
duration: 0.5,
          }}

>

Website Settings

</motion.h1>


<form
onSubmit={handleSubmit}
>


          {/* =================================================
RESTAURANT
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaStore className="section-icon" />

MeshoStore Settings

</h2>


<input
required
name="restaurant_name"
placeholder="Restaurant Name"
value={
settings.restaurant_name
              }
onChange={handleChange}
            />


<input
name="navbar_subtitle"
placeholder="Navbar Subtitle"
value={
settings.navbar_subtitle
}
onChange={handleChange}
/>



<div className="logo-upload-box">

<label>
Navbar Logo
</label>

  {settings.logo&& (
<img
src={`${API_URL}${settings.logo}`}
alt="Current Logo"
className="logo-preview"
    />
  )}


<input
type="file"
accept="image/png,image/jpeg,image/webp"
onChange={(e) => {

const file = e.target.files[0];

if (!file) return;

setLogoFile(file);

  }}
/>

</div>


<textarea
name="about"
placeholder="About Restaurant"
value={
settings.about
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
HERO
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.05,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaBullhorn className="section-icon" />

Hero Section

</h2>


<input
name="hero_title"
placeholder="Hero Title"
value={
settings.hero_title
              }
onChange={handleChange}
            />


<textarea
name="hero_description"
placeholder="Hero Description"
value={
settings.hero_description
              }
onChange={handleChange}
            />


<input
name="hero_button"
placeholder="Hero Button"
value={
settings.hero_button
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
DISCOUNT
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.1,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaPercent className="section-icon" />

Discount Section

</h2>


<input
name="discount_title"
placeholder="Discount Title"
value={
settings.discount_title
              }
onChange={handleChange}
            />


<textarea
name="discount_description"
placeholder="Discount Description"
value={
settings.discount_description
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
BANK
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.15,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaUniversity className="section-icon" />

Bank Transfer

</h2>


<input
name="bank_name"
placeholder="Bank Name"
value={
settings.bank_name
              }
onChange={handleChange}
            />


<input
name="account_name"
placeholder="Account Holder Name"
value={
settings.account_name
              }
onChange={handleChange}
            />


<input
name="account_number"
placeholder="Account Number"
value={
settings.account_number
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
WALLET
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.2,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<MdOutlineAccountBalanceWallet
className="section-icon"
              />

Mobile Wallet

</h2>


<input
name="wallet_name"
placeholder="Wallet Name"
value={
settings.wallet_name
              }
onChange={handleChange}
            />


<input
name="wallet_number"
placeholder="Wallet Number"
value={
settings.wallet_number
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
DELIVERY
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.25,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaTruck className="section-icon" />

Delivery

</h2>


<input
type="text"
name="delivery_time"
placeholder="Standard Shipping Time"
value={settings.delivery_time}
onChange={handleChange}
/>


<input
type="number"
name="pickup_shipping_price"
placeholder="Pickup Price"
value={settings.pickup_shipping_price}
onChange={handleChange}
min="0"
step="0.01"
/>


<input
type="number"
name="standard_shipping_price"
placeholder="Standard Shipping Price"
value={settings.standard_shipping_price}
onChange={handleChange}
min="0"
step="0.01"
/>


<input
type="number"
name="express_shipping_price"
placeholder="Express Shipping Price"
value={settings.express_shipping_price}
onChange={handleChange}
min="0"
step="0.01"
/>


<input
type="text"
name="express_delivery_time"
placeholder="Express Shipping Time"
value={settings.express_delivery_time}
onChange={handleChange}
/>


</motion.section>



          {/* =================================================
CONTACT
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.3,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaPhoneAlt className="section-icon" />

Contact Settings

</h2>


<input
name="phone"
type="tel"
placeholder="Phone Number"
value={
settings.phone
              }
onChange={handleChange}
            />


<input
name="email"
type="email"
placeholder="Email Address"
value={
settings.email
              }
onChange={handleChange}
            />


<textarea
name="address"
placeholder="Restaurant Address"
value={
settings.address
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
SOCIAL
          ================================================= */}

<motion.section
className="settings-card"
initial={{
opacity: 0,
y: 35,
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
duration: 0.45,
delay: 0.35,
            }}
whileHover={{
y: -5,
            }}
>

<h2>

<FaGlobe className="section-icon" />

Social Media

</h2>


<input
name="facebook"
placeholder="Facebook Link"
value={
settings.facebook
              }
onChange={handleChange}
            />


<input
name="instagram"
placeholder="Instagram Link"
value={
settings.instagram
              }
onChange={handleChange}
            />


<input
name="whatsapp"
placeholder="WhatsApp Number"
value={
settings.whatsapp
              }
onChange={handleChange}
            />

</motion.section>



          {/* =================================================
SAVE
          ================================================= */}

<motion.button

className="save-settings-btn"

type="submit"

disabled={saving}

whileTap={{
scale: 0.96,
            }}

>

<FaSave />

            {saving
              ? "Saving..."
              : "Save Changes"
            }

</motion.button>


</form>

</motion.main>

</div>

  );

}


export default AdminSettings;

