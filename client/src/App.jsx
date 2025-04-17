import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import FaultSubmissionForm from "./components/FaultSubmissionForm";
import FaultList from "./components/FaultList";
import UnapprovedAccounts from "./components/UnapprovedAccounts";
import SupervisorDashboard from "./components/SupervisorDashboard";
import HomeScreen from "./components/HomeScreen";
import CompletedFaultList from "./components/CompletedFaultList";
import { useDispatch } from "react-redux";
import { setUsername } from "./features/globalValues/globalSlice";
import ClaimFaults from "./components/ClaimFaults";
import ClaimedFaults from "./components/ClaimedFaults";
import OperatorFaultList from "./components/OperatorFaultList";
import OrderedParts from "./components/OrderedParts";
import AssignFaults from "./components/AssignFaults";
import InventoryManagement from "./components/InventoryManagement";
import ProfileScreen from "./components/ProfileScreen";
import SoldierRoster from "./components/SoldierRoster";
import FaultProgress from "./components/FaultProgress";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
  const dispatch = useDispatch();

  // Load login state from localStorage when the app starts
  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    const storedUsername = localStorage.getItem("username");
    if (storedLoginState === "true") {
      setIsLoggedIn(true);
      if (storedUsername) {
        dispatch(setUsername(storedUsername));
      }
      fetchUserType();
    }
  }, [dispatch]);

  // Fetches the current user's type
  const fetchUserType = async () => {
    try {
      const storedUsername = localStorage.getItem("username");
      if (!storedUsername) return;

      const response = await fetch(
        `http://localhost:3000/api/v1/accounts/user-info?username=${storedUsername}`
      );
      if (!response.ok) throw new Error("Failed to fetch user info");
      const data = await response.json();
      console.log("Fetched data: ", data);

      setUserType(data.accountType);
      localStorage.setItem("userType", data.accountType);
      localStorage.setItem("userID", data.userID);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Provides functionality for user to log in
  const handleLogin = () => {
    setIsLoggedIn(true);
    fetchUserType();
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("lastLoginTime", new Date().toISOString());
  };

  // Provides functionality for user to log out
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userType");
    localStorage.removeItem("userID");
  };

  return (
    <Router>
      <div className="container-main">
        <ToastContainer position="top-center" />

        {/* 
          ADDED: If user is logged in, display a small text line showing their userType. 
          Everything else remains the same as your original code.
        */}
        {isLoggedIn && (
          <div style={{ textAlign: "center", padding: "10px", color: "#ffd700" }}>
            Logged in as: <strong>{userType.charAt(0).toUpperCase() + userType.slice(1)}</strong>
          </div>
        )}

        <Routes>
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

          {isLoggedIn ? (
            <>
              
              <Route path="/home" element={<HomeScreen userType={userType} />} />
              <Route path ="/fault-progress" element={<FaultProgress />} />
              <Route path="/fault-submission" element={<FaultSubmissionForm />} />
              <Route path="/fault-list" element={<FaultList />} />
              <Route path="/completed-faults" element={<CompletedFaultList />} />
              <Route path="/operator-faults" element={<OperatorFaultList />} />
              <Route path="/reopen-fault/:faultId" element={<FaultSubmissionForm isReopenMode={true} />} />
              <Route
                path="/fault-submission"
                element={
                  <>
                    <FaultSubmissionForm />
                    <FaultList />
                  </>
                }
              />
              <Route path="/claim-faults" element={<ClaimFaults />} />
              <Route path="/claimed-faults" element={<ClaimedFaults />} />
              <Route path="/profile" element={<ProfileScreen />} />

              {/* Supervisor Route */}
              {(userType === "supervisor" || userType === "manager") && (
                <>
                  <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
                  <Route path="/assign-faults" element={<AssignFaults />} />
                  <Route path="/soldier-roster" element={<SoldierRoster />} />
                </>
              )}
              {/* Clerk Only Route */}
              {(userType === "clerk" || userType === "manager") && (
                <>
                  <Route path="/ordered-parts" element={<OrderedParts />} />
                  <Route path="/inventory-management" element={<InventoryManagement />} />
                </>
              )}

              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>

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
                    padding: "10px 10px",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Supervisor Dashboard
                </button>
              </Link>
            )}

            <Link to="/profile" style={{ textDecoration: "none" }}>
              <button
                style={{
                  background: "#973c12",
                  color: "white",
                  padding: "10px 10px",
                  borderRadius: "3px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Profile
              </button>
            </Link>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
