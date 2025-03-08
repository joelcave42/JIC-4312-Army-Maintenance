import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import "../styles/HomeScreen.css";
import axios from "axios";

const HomeScreen = ({ userType }) => {
  const [arrivedParts, setArrivedParts] = useState([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only for operator users, check for newly arrived parts
    if (userType === "operator") {
      fetchNewArrivals();
    }
  }, [userType]);

  const fetchNewArrivals = async () => {
    try {
      // 1️⃣ Use the username instead of userID
      const operatorUsername = localStorage.getItem("username");
      console.log("Debug: operatorUsername from localStorage:", operatorUsername);

      if (!operatorUsername) {
        console.log("Debug: No operatorUsername found, skipping fetchNewArrivals.");
        return;
      }

      // 2️⃣ Optionally handle "lastLoginTime" if you want only new arrivals
      const lastLoginTime = localStorage.getItem("lastLoginTime");
      console.log("Debug: lastLoginTime:", lastLoginTime);

      const sinceParam = lastLoginTime ? `?since=${lastLoginTime}` : "";
      // 3️⃣ Build the URL using the username, not the ID
      const url = `http://localhost:3000/api/v1/parts/arrived-operator/${operatorUsername}`;
      console.log("Debug: Final GET URL:", url);

      // 4️⃣ Fetch arrived parts
      const response = await axios.get(url);
      console.log("Debug: Response data from server:", response.data);

      if (response.data.success) {
        const parts = response.data.data;
        console.log("Debug: Number of arrived parts found:", parts.length);
        if (parts.length > 0) {
          setArrivedParts(parts);
          setShowBanner(true);
          console.log("Debug: Banner set to visible with new arrivals.");
        } else {
          console.log("Debug: No new arrived parts found.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch newly arrived parts:", error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    console.log("Debug: Banner dismissed. Updating lastLoginTime to now.");
    // Update 'lastLoginTime' so we won't show these arrivals again
    localStorage.setItem("lastLoginTime", new Date().toISOString());
  };

  return (
    <div className="home-screen">
      <h1 className="home-title">
        U.S. Army Equipment Maintenance Intake System
      </h1>
      <h2>
        Will implement dashboard features in the future and decide which
        functionalities need to be added here
      </h2>

      {/* Banner for newly arrived parts */}
      {userType === "operator" && showBanner && arrivedParts.length > 0 && (
        <div style={{ background: "#333", color: "#ffd700", padding: 10, margin: 10 }}>
          <h3>New Arrivals Since Last Login</h3>
          <ul>
            {arrivedParts.map((part) => (
              <li key={part._id}>
                Part "{part.partName}" arrived for Fault #{part.fault?._id?.toString().slice(-4)}
              </li>
            ))}
          </ul>
          <button onClick={handleDismiss}>Dismiss</button>
        </div>
      )}

      {/* Render the role-based menu */}
      <Menu userType={userType} />
    </div>
  );
};

export default HomeScreen;
