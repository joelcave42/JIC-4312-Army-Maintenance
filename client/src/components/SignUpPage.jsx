import React, { useState } from "react";
import "../styles/SignUpPage.css"; // Optional styling import
import armyimage from '../assets/armyimage.png';
import armyImageWhite from '../assets/armyImageWhite.png';
import { useNavigate } from "react-router-dom";
 
function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for password confirmation
  const [accountType, setAccountType] = useState("clerk"); // Default to the first account type
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the password and confirm password match
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please re-enter.");
      return; // Prevent submission if they don't match
    }
 
    const newUser = { username, password, accountType };
 
    try {
      const response = await fetch("http://localhost:3000/api/v1/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
 
      const data = await response.json();
 
      if (response.ok && data.success) {
        alert("Sign up successful!");
        navigate("/");
      } else {
        // If the message contains E11000, it’s a duplicate username
        if (data.message && data.message.includes("E11000")) {
          alert("That username is already taken. Please choose a different one.");
        } else {
          alert("Error signing up: " + data.message);
        }
      }      
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };
 
  return (
    <div>
      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate("/")} // Navigate back to the login page
      >
        Back to Login
      </button>
      <div className="signup-container">
        {/* Army Logo */}
        <img src={armyImageWhite} alt="U.S. Army Logo" className="army-logo" />

        <h2>Create an Account</h2>
        <p className="disclaimer">
          For official use by authorized U.S. Army personnel.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {/* New Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="accountType">Account Type:</label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >
              <option value="clerk">Clerk</option>
              <option value="maintainer">Maintainer</option>
              <option value="manager">Manager</option>
              <option value="operator">Operator</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
 
export default SignUpPage;
