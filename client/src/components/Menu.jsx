import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Menu.css"; // Optional styling

const Menu = ({ userType }) => {
  const navigate = useNavigate();
  const normalizedUserType = userType ? userType.toLowerCase().trim() : "";

  console.log("Normalized User Type:", normalizedUserType);

  return (
    <div className="menu">
      {normalizedUserType === "clerk" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
          <button onClick={() => navigate("/ordered-parts")}>
            Ordered Parts
          </button> {/* New button for part ordering */}
          <button onClick={() => navigate("/inventory-management")}>
            Inventory Management
          </button> {/* New button for inventory management */}
        </>
      )}

      {normalizedUserType === "maintainer" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/claim-faults")}>
            Claim Faults
          </button>
          <button onClick={() => navigate("/claimed-faults")}>
            Claimed Faults
          </button>
        </>
      )}

      {normalizedUserType === "manager" && (
        <>
          <button onClick={() => navigate("/fault-progress")}>
            Fault Progress
          </button>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
          <button onClick={() => navigate("/ordered-parts")}>
            Ordered Parts
          </button>
          <button onClick={() => navigate("/inventory-management")}>
            Inventory Management
          </button>
          <button onClick={() => navigate("/claim-faults")}>
            Claim Faults
          </button>
          <button onClick={() => navigate("/claimed-faults")}>
            Claimed Faults
          </button>
          <button onClick={() => navigate("/operator-faults")}>
            My Fault Submissions & Parts
          </button>
          <button onClick={() => navigate("/supervisor-dashboard")}>
            Supervisor Dashboard
          </button>
          <button onClick={() => navigate("/assign-faults")}>
            Assign Faults for Maintainers
          </button>
        </>
      )}

      {normalizedUserType === "operator" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check All Reported Faults
          </button>
          <button onClick={() => navigate("/operator-faults")}>
            My Fault Submissions & Parts
          </button>  
        </>
      )}

      {normalizedUserType === "supervisor" && (
        <>
          <button onClick={() => navigate("/supervisor-dashboard")}>
            Supervisor Dashboard
          </button>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
        </>
      )}
    </div>
  );
};

export default Menu;
