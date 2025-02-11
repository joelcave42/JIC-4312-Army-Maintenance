import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import FaultSubmissionForm from "./components/FaultSubmissionForm";
import FaultList from "./components/FaultList";
import HomeScreen from "./components/HomeScreen";
import CompletedFaultList from "./components/CompletedFaultList";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <Router>
      <div className="container-main">
        <ToastContainer position="top-center" />

        <Routes>
          {}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/home" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route path="/signup" element={<SignUpPage />} />

          {}
          {isLoggedIn ? (
            <>
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/fault-submission" element={<FaultSubmissionForm />} />
              <Route path="/fault-list" element={<FaultList />} />
              <Route path="/completed-faults" element={<CompletedFaultList />} />
              {}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>

        {}
        {isLoggedIn && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "25px",
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
                margin: "10px 0",
              }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
