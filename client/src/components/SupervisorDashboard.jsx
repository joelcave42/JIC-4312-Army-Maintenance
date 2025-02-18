import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SupervisorDashboard.css";
import { toast } from "react-toastify";

const url = "http://localhost:3000/api/v1/accounts/unapproved"; // URL to fetch unapproved accounts

const SupervisorDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const fetchUnapprovedAccounts = async () => {
    try {
      const response = await axios.get(url);
      setAccounts(response.data.data || []); // Ensure we store an array
    } catch (error) {
      console.error("Error fetching unapproved accounts:", error);
      toast.error("Failed to load unapproved accounts");
    }
  };

  const approveAccount = async (userId) => {
    try {
      await axios.put(`http://localhost:3000/api/v1/accounts/approve/${userId}`);

      // Remove the approved account from the list
      setAccounts((prevAccounts) => prevAccounts.filter((account) => account._id !== userId));

      toast.success("Account successfully approved!");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve account");
    }
  };

  useEffect(() => {
    fetchUnapprovedAccounts();
  }, []); // Fetch only on first render

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="supervisor-dashboard">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <button onClick={toggleVisibility} className="toggle-dashboard-button">
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
                  <p className="account-type">Account Type: {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}</p>
                  <div className="account-actions">
                    <button onClick={() => approveAccount(account._id)} className="approve-btn">
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
