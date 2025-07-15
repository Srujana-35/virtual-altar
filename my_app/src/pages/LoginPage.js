import React,{useState} from 'react';
import { Link,useNavigate } from "react-router-dom";
function Login()
{
    const[mail,setmail]=useState("");
    const[password,setpassword]=useState("");
    const navigate=useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: mail,
                    password: password
                })
            });
            const data = await response.json();
            if (response.ok) {
                // Save the token to localStorage
                localStorage.setItem('token', data.token);
                
                // Save user information to localStorage
                const userInfo = {
                    username: data.username || mail.split('@')[0], // Use email prefix if username not provided
                    email: mail
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                alert("Login successful");
                navigate("/wall");
            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            alert("Error connecting to server");
        }
    };// Redirect to the wall page after successful login

     return(
       <div className="login-container">
             <header className="header combined-header">
               <span className="site-title">Virtual Wall Decorator</span>
               <nav className="header-nav">
                 <Link to="/">Home</Link>
                 <Link to="/login" className="active">Login</Link>
                 <Link to="/signup">Sign Up</Link>
                 <Link to="/profile">Profile</Link>
               </nav>
             </header>
            <div className="login-content">
              <h2>Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email:</label>
                  <input 
                    type="email"
                    placeholder="Email"
                    value={mail}
                    onChange={(e)=>setmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password:</label>
                  <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setpassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit">Login</button>
              </form>
              <p>Don't have an account? <Link to="/signup">Signup</Link></p>
            </div>
          

        </div>

    );
}
export default Login;