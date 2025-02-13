import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="home-screen">
      <h1 className="home-title">U.S. Army Equipment Maintenance Intake System</h1>
      <div className="home-buttons">
        <button 
          className="home-button" 
          onClick={() => navigate("/fault-submission")}
        >
          Fault Submission Form
        </button>
        <button 
          className="home-button" 
          onClick={() => navigate("/fault-list")}
        >
          View Current Fault List
        </button>
        <button 
          className="home-button" 
          onClick={() => navigate("/completed-faults")}
        >
          View Previously Corrected Faults
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
