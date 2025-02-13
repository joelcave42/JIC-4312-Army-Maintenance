import React from "react";
import Menu from "./Menu";
import "../styles/HomeScreen.css";

const HomeScreen = ({ userType }) => {
  return (
    <div className="home-screen">
      <h1 className="home-title">
        U.S. Army Equipment Maintenance Intake System
      </h1>
      <h2>Will implement dashboard features in the future and decide which functionalities need to be added here</h2>

      {/* <div className="home-buttons">
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
      </div> */}
      
      {/* Render the role-based menu */}
      <Menu userType={userType} />
    </div>
  );
};

export default HomeScreen;
