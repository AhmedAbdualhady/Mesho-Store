import "./Contact.css";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

import {
useState,
useEffect
} from "react";


import toast from "react-hot-toast";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";



function Contact() {

useEffect(() => {
window.scrollTo({
top: 0,
behavior: "auto"
  });
}, []);

  
const [form, setForm] = useState({
name: "",
email: "",
message: "",
  });



const [settings, setSettings] =
useState({});

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
          "Contact Settings Error:",
error
        );

      }

    };


fetchSettings();

}, []);





const handleChange = (e) => {
setForm({
      ...form,
[e.target.name]: e.target.value,
    });
  };



const handleSubmit = async (e) => {

e.preventDefault();


try {

const response =
await fetch(
        `${API_URL}/api/contact`,
        {
method: "POST",

headers: {
            "Content-Type":
              "application/json",
          },

body: JSON.stringify(form),

        }
      );


const data =
await response.json();


if (!response.ok) {

throw new Error(
data.message ||
        "Failed to send message"
      );

    }


toast.success(
      "Your message has been sent successfully!"
    );


setForm({

name: "",

email: "",

message: "",

    });


  } catch (error) {

console.error(
      "Contact Error:",
error
    );


toast.error(
error.message ||
      "Failed to send your message."
    );

  }

};


  
return (
<>

<motion.main
className="contact-page"

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


<motion.div

className="contact-header"

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}>
  



<span>GET IN TOUCH</span>

<h1>
  How Can We Help?
</h1>


<p>
Have a question about an order, product or delivery?
We're here to help.
</p>

</motion.div>


<div className="contact-layout">
<div className="contact-info">
<div className="contact-item">
<FaEnvelope />
<div>
<h3>Email</h3>

<p>
  {
settings.email ||
    "Email not available"
  }
</p>

</div>
</div>

<div className="contact-item">
<FaPhone />
<div>
<h3>Phone</h3>

<p>
  {
settings.phone ||
    "Phone not available"
  }
</p>

</div>
</div>

<div className="contact-item">
<FaMapMarkerAlt />
<div>
<h3>Location</h3>

<p>
  {
settings.address ||
    "Address not available"
  }
</p>

</div>
</div>
</div>

<form
className="contact-form"
onSubmit={handleSubmit}
>
<input
type="text"
name="name"
placeholder="Your Name"
required
value={form.name}
onChange={handleChange}
            />

<input
type="email"
name="email"
placeholder="Your Email"
required
value={form.email}
onChange={handleChange}
            />

<textarea
name="message"
placeholder="How can we help?"
required
value={form.message}
onChange={handleChange}
            />

<button type="submit">
Send Message
</button>
</form>
</div>
</motion.main>
</>
  );
}

export default Contact;


