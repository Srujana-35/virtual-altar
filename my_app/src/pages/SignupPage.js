import React,{useState} from 'react';
import './pages.css';
import { Link ,useNavigate} from "react-router-dom";
function Signup(){
    const navigate=useNavigate();
    const[username,setusername]=useState("");
    const[mail,setmail]=useState("");
    const[password,setpassword]=useState("");
    const[repassword,setrepassword]=useState("");
    const [passwordStrength, setPasswordStrength] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    // Password strength checker function
    function checkPasswordStrength(pw) {
      let strength = 0;
      if (pw.length >= 8) strength++;
      if (/[A-Z]/.test(pw)) strength++;
      if (/[a-z]/.test(pw)) strength++;
      if (/[0-9]/.test(pw)) strength++;
      if (/[^A-Za-z0-9]/.test(pw)) strength++;
      if (pw.length === 0) return "";
      if (strength <= 2) return "Weak password";
      if (strength === 3 || strength === 4) return "Medium password";
      if (strength === 5) return "Strong password";
      return "Weak password";
    }
    const handlesubmit = async (e) => {
        e.preventDefault();
        if(password!==repassword){
            alert("passwords do not match");
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    email: mail,
                    password: password
                })
            });
            const data = await response.json();
            if (response.ok) {
                // Save user information to localStorage for immediate access
                const userInfo = {
                    username: username,
                    email: mail
                };
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                alert("Signup successful!");
                navigate("/login");
            } else {
                alert(data.error || "Signup failed");
            }
        } catch (err) {
            alert("Error connecting to server");
        }
    };

    return(
      
        <div className="signup-container">
            <header className="header combined-header">
              <span className="site-title">Virtual Wall Decorator</span>
              <nav className="header-nav">
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/signup" className="active">Sign Up</Link>
                <Link to="/profile">Profile</Link>
              </nav>
            </header>
        <div className="signup-content">
            <h2>Sign Up</h2>
            <p>Create your account</p>
            <form onSubmit={handlesubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input 
                    type="text"
                    value={username}
                    onChange={(e)=>setusername(e.target.value)}
                    placeholder="Username"
                    required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                    type="email"
                    value={mail}
                    onChange={(e)=>setmail(e.target.value)}
                    placeholder="Email"
                    required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e)=> {
                      setpassword(e.target.value);
                      setPasswordStrength(checkPasswordStrength(e.target.value));
                    }}
                    placeholder="Password"
                    required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ marginLeft: "8px", padding: "2px 8px", fontSize: "0.9em" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                {password && (
                  <div style={{
                    color: passwordStrength === "Strong password" ? "green" : passwordStrength === "Medium password" ? "orange" : "red",
                    fontWeight: "bold",
                    marginTop: "4px"
                  }}>
                    {passwordStrength}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input 
                    type={showRePassword ? "text" : "password"}
                    value={repassword}
                    onChange={(e)=>setrepassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                />
                <button
                  type="button"
                  onClick={() => setShowRePassword((prev) => !prev)}
                  style={{ marginLeft: "8px", padding: "2px 8px", fontSize: "0.9em" }}
                >
                  {showRePassword ? "Hide" : "Show"}
                </button>
              </div>
              <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
        </div>
    )
}
export default Signup;