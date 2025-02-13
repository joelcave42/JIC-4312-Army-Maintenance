import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Menu.css"; // Optional styling

const Menu = ({ userType }) => {
  const navigate = useNavigate();

  return (
    <div className="menu">
      {userType === "clerk" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Fault Submission Form
          </button>
          <button onClick={() => navigate("/fault-list")}>
            View Current Fault List
          </button>
        </>
      )}

      {userType === "maintainer" && (
        <>
          <button onClick={() => navigate("/assigned-faults")}>
            View Assigned Faults
          </button>
          <button onClick={() => navigate("/completed-faults")}>
            View Completed Faults
          </button>
        </>
      )}

      {userType === "manager" && (
        <>
          <button onClick={() => navigate("/manager-dashboard")}>
            Manager Dashboard
          </button>
          <button onClick={() => navigate("/fault-list")}>
            View All Faults
          </button>
        </>
      )}

      {userType === "operator" && (
        <>
          <button onClick={() => navigate("/operator-dashboard")}>
            Operator Dashboard
          </button>
          <button onClick={() => navigate("/equipment-status")}>
            View Equipment Status
          </button>
        </>
      )}

      {userType === "supervisor" && (
        <>
          <button onClick={() => navigate("/supervisor-dashboard")}>
            Supervisor Dashboard
          </button>
          <button onClick={() => navigate("/manage-faults")}>
            Manage Faults
          </button>
        </>
      )}
    </div>
  );
};

export default Menu;
