import "./ForgotPassword.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { FaCheckCircle } from "react-icons/fa";




function ForgotPassword() {

const [email, setEmail] = useState("");
const [code, setCode] = useState("");
const [newPassword, setNewPassword] = useState("");
const navigate = useNavigate();
const [successMessage, setSuccessMessage] = useState("");
const [codeSent, setCodeSent] = useState(false);



useEffect(()=>{

window.scrollTo({
top:0,
behavior:"auto"
});

},[]);


const sendCode = async (e) => {

e.preventDefault();

if (!email) {
alert("Please enter your email");
return;
}

try {

const res = await fetch(
"http://localhost:5000/api/forgot-password",

{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({ email })
}
);

const data = await res.json();

if(data.success){

setCodeSent(true);
alert("Verification code sent to your email.");

}else{

alert(data.message);

}

} catch(err){

console.error(err);
alert("Something went wrong");

}

};



const resetPassword = async (e) => {

e.preventDefault();

if (!email || !code || !newPassword) {

alert("Please fill all fields");
return;

}

if (newPassword.length< 8) {

alert("Password must be at least 8 characters");
return;

}

try {

const res = await fetch(
"http://localhost:5000/api/reset-password",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
code,
newPassword
})
}
);

const data = await res.json();

if(data.success){

setSuccessMessage(
"✅Password Updated Successfully! Redirecting to Login..."
);

setEmail("");
setCode("");
setNewPassword("");

setTimeout(()=>{
navigate("/login");
},2000);

}else{

alert(data.message);

}

}catch(err){

console.error(err);
alert("Something went wrong");

}

};



return (

<motion.div

className="forgot-container"

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


<div className="forgot-card">


<motion.h2
className="forgot-title"
initial={{ opacity: 0, x: -40 }}
animate={{ opacity: 1, x: 0 }}
transition={{
delay: .2,
duration: .5
}}>
Forgot Password

</motion.h2>


{successMessage&& (
<p className="success-message">
{successMessage}
</p>
)}



<form onSubmit={sendCode}>

<input
type="email"
required
placeholder="Enter Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>



{!codeSent ? (

<button type="submit">
Send Code
</button>

) : (

<p className="code-sent-message">
<FaCheckCircle className="check-forgot-password"/> Verification code has been sent to your email.
</p>

)}

</form>


<form onSubmit={resetPassword}>

<input
type="text"
required
placeholder="Enter Code"
value={code}
onChange={(e)=>setCode(e.target.value)}
/>

<input
type="password"
required
minLength={8}
placeholder="New Password"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
/>

<button type="submit">
Reset Password
</button>

</form>

</div>


</motion.div>


  );

}

export default ForgotPassword;

