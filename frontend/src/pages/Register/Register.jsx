import { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./Register.css";
import { motion } from "framer-motion";

import { FaEye, FaEyeSlash } from "react-icons/fa";



function Register() {
  
const navigate = useNavigate();
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


useEffect(()=>{

window.scrollTo({
top:0,
behavior:"auto"
});

},[]);


const handleRegister = (e) => {
e.preventDefault();

if (password !== confirmPassword) { 
alert("Passwords do not match");
return;
}
  fetch("http://localhost:5000/api/register", {
method: "POST",
headers: {
    "Content-Type": "application/json",
  },
body: JSON.stringify({
name,
email,
password,
  }),
})
  .then((res) =>res.json())
  .then((data) => {

if (data.success) {

alert("Registered Successfully");
navigate("/login");

}else{

alert(data.message);

}

})
.catch((err) => {
console.error(err);
alert("Something went wrong");
});

};
 


return (

<motion.div

className="register-container"


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

Create Account

</motion.h1>



<form className="register-form" onSubmit={handleRegister}>

<input
type="text"
required
placeholder="Full Name"
value={name}
onChange={(e) =>setName(e.target.value)}
      />

<input
type="email"
required
placeholder="Email"
value={email}
onChange={(e) =>setEmail(e.target.value)}
      />


<div className="register-password-box">

<input
type={showPassword ? "text" : "password"}
required
minLength={8}
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<button
type="button"
className="register-show-btn"
onClick={()=>setShowPassword(!showPassword)}
>


{showPassword ? <FaEyeSlash /> : <FaEye />}


</button>

</div>



<div className="register-password-box">

<input
type={showConfirmPassword ? "text" : "password"}
required
minLength={8}
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
/>

<button
type="button"
className="register-show-btn"
onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
>


{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}


</button>

</div>


<button type="submit" >
Register
</button>

<p className="login-link">
Already have an account?

<Link to="/login">
Login
</Link>
</p>
</form>


</motion.div>

  );
}

export default Register;
