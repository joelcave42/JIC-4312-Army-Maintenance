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
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
        </>
      )}

      {userType === "maintainer" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
        </>
      )}

      {userType === "manager" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
        </>
      )}

      {userType === "operator" && (
        <>
          <button onClick={() => navigate("/fault-submission")}>
            Start 5988
          </button>
          <button onClick={() => navigate("/fault-list")}>
            Check Reported Faults
          </button>
        </>
      )}

      {userType === "supervisor" && (
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
