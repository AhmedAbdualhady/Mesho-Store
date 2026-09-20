import "./Footer.css";

import {
FaPhoneAlt,
FaEnvelope,
FaMapMarkerAlt,
FaFacebookF,
FaInstagram,
FaWhatsapp
} from "react-icons/fa";

import {
motion
} from "framer-motion";

import {
useEffect,
useState
} from "react";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";



function Footer() {

const [
settings,
setSettings
  ] = useState({});


useEffect(() => {

const fetchSettings =
async () => {

try {

const response =
await fetch(
              `${API_URL}/api/settings`
            );

if (!response.ok) {
throw new Error(
              "Failed to load settings"
            );
          }

const data =
await response.json();

setSettings(
data || {}
          );

        } catch (error) {

console.error(
            "Footer Settings Error:",
error
          );

        }

      };


fetchSettings();

  }, []);


return (

<motion.footer

className="footer"

initial={{
opacity: 0,
y: 30
      }}

animate={{
opacity: 1,
y: 0
      }}

transition={{
duration: .8
      }}

>

<div className="footer-container">


<h2>

          {
settings.restaurant_name 
          }

</h2>


<p>

          {
settings.about 
          }

</p>


<div className="footer-info">


<p>

<FaPhoneAlt />

            {settings.phone ||
              "Phone not available"}

</p>


<p>

<FaEnvelope />

            {settings.email ||
              "Email not available"}

</p>


<p>

<FaMapMarkerAlt />

            {settings.address ||
              "Address not available"}

</p>


</div>


<div className="footer-social">


          {
settings.whatsapp&& (

<a

href={
                  `https://wa.me/${settings.whatsapp}`
                }

target="_blank"

rel="noreferrer"

>

<FaWhatsapp />

WhatsApp

</a>

            )
          }


          {
settings.facebook&& (

<a

href={
settings.facebook
                }

target="_blank"

rel="noreferrer"

>

<FaFacebookF />

Facebook

</a>

            )
          }


          {
settings.instagram&& (

<a

href={
settings.instagram
                }

target="_blank"

rel="noreferrer"

>

<FaInstagram />

Instagram

</a>

            )
          }


</div>


<p className="copyright">

          © 2026{" "}

          {
settings.restaurant_name
        }

</p>


</div>

</motion.footer>

  );

}


export default Footer;
