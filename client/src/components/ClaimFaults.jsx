import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClaimFaults.css"; // or reuse FaultList.css
import axios from "axios"; // #2: import axios for "patch" requests
import { toast } from "react-toastify"; // #3: if you want to show success messages
import { store } from "../store"; // #4: if you want to dispatch a global status
import { changeStatusListener } from "../features/globalValues/globalSlice"; // #5 


const ClaimFaults = () => {
  const [pendingFaults, setPendingFaults] = useState([]);
  const navigate = useNavigate();

  // We'll fetch from the same base URL as in FaultList

  const url = "http://localhost:3000/api/v1/faults"; 

  useEffect(() => {
    fetchPendingFaults();
  }, []);

  const fetchPendingFaults = async () => {
    try {
      // Just like in your existing code
      const response = await axios.get(url);
      const data = response.data; // {faults, count}

      if (data.faults) {
        // If status is an array, check includes("pending")
        const pending = data.faults.filter(fault =>
          Array.isArray(fault.status)
            ? fault.status.includes("pending")
            : fault.status === "pending"
        );
        setPendingFaults(pending);
      }
    } catch (error) {
      console.error("Error fetching faults:", error);
    }
  };


  const claimFault = async (faultID) => {
    try {
      const maintainerID = localStorage.getItem("userID");
      if (!maintainerID) {
        alert("Error: No user ID found in localStorage.");
        return;
      }
  
      const response = await axios.patch(`${url}/${faultID}/claim`, { maintainerID });
  
      if (response.status === 200) {
        // Remove claimed fault from the list
        setPendingFaults(prev => prev.filter(f => f._id !== faultID));
        toast.success("Fault claimed successfully!");
      } else {
        toast.error("Failed to claim fault.");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error claiming fault");
      console.error("Error claiming fault:", error);
    }
  };
  
  
  return (
    <div className="claim-faults-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <h2 className="claim-faults-title">Pending Faults</h2>

      <div className="fault-items">
        {pendingFaults.length === 0 ? (
          <p>No pending faults available.</p>
        ) : (
          pendingFaults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    {issue}
                  </li>
                ))}
              </ul>
              <div className="fault-actions">
                <button
                  onClick={() => claimFault(fault._id)}
                  className="correct-btn" /* same style as "Fault Corrected" */
                >
                  Claim Fault
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClaimFaults;
