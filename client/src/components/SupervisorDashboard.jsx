import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const url = "http://localhost:3000/api/v1/accounts/unapproved";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const fetchUnapprovedAccounts = async () => {
    try {
      const response = await axios.get(url);
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching unapproved accounts:", error);
      toast.error("Failed to load unapproved accounts");
    }
  };

  const approveAccount = async (userId) => {
    try {
      await axios.put(`http://localhost:3000/api/v1/accounts/approve/${userId}`);
      setAccounts((prev) => prev.filter((account) => account._id !== userId));
      toast.success("Account successfully approved!");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve account");
    }
  };

  useEffect(() => {
    fetchUnapprovedAccounts();
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="supervisor-dashboard">
      
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
  
     
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button
          onClick={toggleVisibility}
          className="toggle-dashboard-button fixed-button-width"
        >
          {isVisible ? "Hide Unapproved Accounts" : "Show Unapproved Accounts"}
        </button>
      </div>
  
   
      {isVisible && (
        <div>
          <h2>Unapproved Accounts:</h2>
          <div className="account-items">
            {accounts.length === 0 ? (
              <p>No unapproved accounts.</p>
            ) : (
              accounts.map((account) => (
                <div key={account._id} className="account-item">
                  <p className="account-username">Username: {account.username}</p>
                  <p className="account-type">
                    Account Type:{" "}
                    {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                  </p>
                  <div className="account-actions">
                    <button
                      onClick={() => approveAccount(account._id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
  
   
      <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/assign-faults")}
          className="toggle-dashboard-button fixed-button-width"
        >
          Claim Faults for Maintainers
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <button
            onClick={() => navigate("/soldier-roster")}
            className="toggle-dashboard-button fixed-button-width"
        >
            Soldier Roster
        </button>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
