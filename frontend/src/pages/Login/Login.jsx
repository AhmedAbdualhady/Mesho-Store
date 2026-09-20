import "./Login.css";
import { useState , useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { motion } from "framer-motion";

import { FaEye, FaEyeSlash } from "react-icons/fa";


const API_URL =
import.meta.env.VITE_API_URL || "http://localhost:5000";


function Login() {

const navigate = useNavigate();
const location = useLocation();
  
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);

useEffect(() => {

window.scrollTo({
  top:0,
  behavior:"auto"
});

const savedEmail =
localStorage.getItem("userEmail");

if (savedEmail) {
setEmail(savedEmail);
setRememberMe(true);

 }

}, []);

const handleLogin = (e) => {
e.preventDefault();

if (!email || !password) {
alert("Please fill all fields");
return;
    }
    
    
fetch(`${API_URL}/api/login`, {

  method: "POST",
headers: {
    "Content-Type": "application/json",
  },
body: JSON.stringify({
email,
password,
  }),
})
  .then((res) =>res.json())
  .then((data) => {
if (data.success) {


localStorage.setItem("token", data.token);

localStorage.setItem(
  "user",
JSON.stringify(data.user)
);



if (rememberMe) {

localStorage.setItem("userEmail", email);

} else {

localStorage.removeItem("userEmail");

}



alert("Login Successful");



if (data.user.is_admin === 1) {

navigate("/admin/dashboard");

} else {

const redirect =
location.state?.from || "/";

navigate(redirect);

}



    } else {
alert("Invalid Email Or Password");
    }
  })
  
.catch(err =>console.error(err));

};



return (

<>

<motion.div

className="login-container"


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


<motion.h1

initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}>

Login

</motion.h1>


<form className="login-form" onSubmit={handleLogin}>

<input
type="email"
required
placeholder="Enter Email"
value={email}
onChange={(e) =>setEmail(e.target.value)}
      />


<div className="password-box">

<input
type={showPassword ? "text" : "password"}
required
minLength={8}
placeholder="Enter Password"
value={password}
onChange={(e) =>setPassword(e.target.value)}
/>

<button
type="button"
className="show-btn"
onClick={() =>setShowPassword(!showPassword)}
>


{showPassword ? <FaEyeSlash /> : <FaEye />}


</button>

</div>


<label className="remember">
<input
type="checkbox"
checked={rememberMe}
onChange={() =>setRememberMe(!rememberMe)}
  />

Remember Me
</label>

<button type="submit">
Login
</button>

<Link className="forgot-password" to="/forgot-password">
Forgot Password?
</Link>

<p className="register-link">
Don't have an account?
<Link to="/register">
Register
</Link>
</p>
</form>


</motion.div>

</>
  );
}

export default Login;
