import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import FaultSubmissionForm from "./components/FaultSubmissionForm";
import FaultList from "./components/FaultList";
import UnapprovedAccounts from "./components/UnapprovedAccounts"; 
import SupervisorDashboard from "./components/SupervisorDashboard"; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
 
  // Load login state from localStorage when the app starts
  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true") {
      setIsLoggedIn(true);
      fetchUserType();
    }
  }, []);

  const fetchUserType = async () => {
    try {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) return;

      const response = await fetch(`http://localhost:3000/api/v1/accounts/user-info?username=${storedUsername}`);
      if (!response.ok) throw new Error("Failed to fetch user info");
      const data = await response.json();
      setUserType(data.accountType);
      localStorage.setItem("userType", data.accountType);
    } catch (error) {
      console.error(error.message);
    }
  };
 
  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchUserType(); // Corrected: Fetch userType after login
    localStorage.setItem("isLoggedIn", "true"); // Save login state
  };
 
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType("");
    localStorage.removeItem("isLoggedIn"); // Remove login state
    localStorage.removeItem("username");
    localStorage.removeItem("userType");
  };
 
  return (
    <Router>
      <div className="container-main">
        <ToastContainer position="top-center" />
 
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/fault-submission" /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route path="/signup" element={<SignUpPage />} />
 
          {/* Protected Routes */}
          {isLoggedIn ? (
            <>
              <Route
                path="/fault-submission"
                element={
                  <>
                    <FaultSubmissionForm />
                    <FaultList /> {/* Include FaultList here */}
                  </>
                }
              />
              {/* Supervisor Route */}
              {userType === "supervisor" && (
                <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />  
              )}
            </>
          ) : (
            // Redirect to login if not logged in
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
 
        {/* Logout Button */}
        {isLoggedIn && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "25px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              style={{
                background: "#973c12",
                color: "white",
                padding: "10px 20px",
                borderRadius: "3px",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleLogout}
            >
              Sign Out
            </button>

            {/* Supervisor Dashboard Button */}
            {userType === "supervisor" && (
              <Link to="/supervisor-dashboard" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    background: "#973c12",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/supervisor-dashboard")}
                >
                Supervisor Dashboard
              </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Router>
  );
}
 
export default App;
