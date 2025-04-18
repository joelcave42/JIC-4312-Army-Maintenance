import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClaimFaults.css"; // For basic styling
import "../styles/FaultList.css"; // For validate-btn styles
import axios from "axios"; // #2: import axios for "patch" requests
import { toast } from "react-toastify"; // #3: if you want to show success messages
import { store } from "../store"; // #4: if you want to dispatch a global status
import { changeStatusListener } from "../features/globalValues/globalSlice"; // #5 
import Select from "react-select";


const ClaimFaults = () => {
  const [pendingFaults, setPendingFaults] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchVehicleId, setSearchVehicleId] = useState("");
  // We'll fetch from the same base URL as in FaultList
  const url = "http://localhost:3000/api/v1/faults"; 

  useEffect(() => {
    fetchPendingFaults();
  }, []);

  const fetchPendingFaults = async () => {
    try {
      // Use the /pending endpoint which now returns both pending and validated faults
      const response = await axios.get(`${url}/pending`);
      const data = response.data; // {faults, count}

      if (data.faults) {
        // Filter out any faults that are already claimed
        const availableFaults = data.faults.filter(fault => !fault.isClaimed);
        setPendingFaults(availableFaults);
        availableFaults.forEach((fault) => fetchImageForFault(fault._id));
      }
    } catch (error) {
      console.error("Error fetching faults:", error);
      toast.error("Failed to fetch pending faults");
    }
  };

  const fetchImageForFault = async (faultId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/faults/${faultId}/image`,
        { responseType: "blob" }
      );
      const imageURL = URL.createObjectURL(response.data);
      setImageUrls((prev) => ({ ...prev, [faultId]: imageURL }));
    } catch (error) {
      console.warn(`No image for fault ${faultId}`);
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
        store.dispatch(changeStatusListener());
      } else {
        toast.error("Failed to claim fault.");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error claiming fault");
      console.error("Error claiming fault:", error);
    }
  };
  
  // Add validateFault function
  const validateFault = async (id) => {
    try {
      const response = await axios.patch(`${url}/${id}/validated`);
      
      // Update the fault in the local state
      setPendingFaults((prev) => 
        prev.map((fault) => 
          fault._id === id ? { ...fault, status: "validated" } : fault
        )
      );
      
      store.dispatch(changeStatusListener());
      toast.success("Fault validated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to validate fault");
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "transparent",
      borderColor: "#FFD700",
      boxShadow: "none",
      color: "#FFD700",
      minHeight: "40px",
      "&:hover": { borderColor: "#FFD700" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1e2a1e",
      color: "#FFD700",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgba(255, 215, 0, 0.2)" : "transparent",
      color: "#FFD700",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#FFD700",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#FFD700",
    }),
  };

  const filteredAndSortedFaults = [...pendingFaults]
  .filter((fault) =>
    fault.vehicleId.toLowerCase().includes(searchVehicleId.toLowerCase())
  )
  .sort((a, b) => {
    let comparison = 0;

    if (sortBy === "vehicleId") {
        comparison = a.vehicleId.localeCompare(b.vehicleId);
        if (comparison === 0) {
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
        }
    } else if (sortBy === "date_asc") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        if (comparison === 0) {
          comparison = a.vehicleId.localeCompare(b.vehicleId);
        }
    } else if (sortBy === "date_desc") {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
        if (comparison === 0) {
          comparison = a.vehicleId.localeCompare(b.vehicleId);
        }
    }
    return comparison;
  });
  
  return (
    <div className="claim-faults-main">
      <button className="back-button" onClick={() => navigate("/supervisor-dashboard")}>
        Back
      </button>

      <h2 className="claim-faults-title">Pending Faults</h2>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "20px", width: "100%" }}>
        <span style={{ color: "#FFD700" }}>Sort By:</span>
        <div style={{ width: "200px" }}>
          <Select
            options={[
              { value: "vehicleId", label: "Vehicle ID" },
              { value: "status", label: "Status" },
              { value: "date_asc", label: "Date (Ascending)" },
              { value: "date_desc", label: "Date (Descending)" },
            ]}
            value={{ value: sortBy, label: {
              vehicleId: "Vehicle ID",
              status: "Status",
              date_asc: "Date (Ascending)",
              date_desc: "Date (Descending)"
            }[sortBy] }}
            onChange={(selected) => setSortBy(selected.value)}
            placeholder="Sort By"
            styles={selectStyles}
          />
        </div>
        <input
          type="text"
          placeholder="Search by vehicle id"
          value={searchVehicleId}
          onChange={(e) => setSearchVehicleId(e.target.value)}
          style={{
            backgroundColor: "#1e2a1e",
            border: "1px solid #FFD700",
            color: "#FFD700",
            padding: "8px",
            borderRadius: "4px",
            outline: "none",
            height: "40px",
            flexGrow: 1,
            width: "100%",
            minWidth: "200px",
            '::placeholder': { color: "rgba(255, 215, 0, 0.6)" },
          }}
        />
      </div>

      <div className="fault-items">
        {filteredAndSortedFaults.length === 0 ? (
          <p>No pending faults available.</p>
        ) : (
          filteredAndSortedFaults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-date">Created on: {new Date(fault.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</p>
              <p className="fault-status"><strong>Status:</strong> {fault.status}</p>
              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    {issue}
                  </li>
                ))}
              </ul>
              {imageUrls[fault._id] && (
                <div className="fault-image-preview">
                    <img
                    src={imageUrls[fault._id]}
                    alt="Fault visual"
                    className="preview-img"
                    style={{ maxWidth: "100%", maxHeight: "200px", margin: "10px 0" }}
                    />
                </div>
              )}
              <div className="fault-actions">
                <button
                  onClick={() => claimFault(fault._id)}
                  className="correct-btn" /* same style as "Fault Corrected" */
                >
                  Claim Fault
                </button>
                
                {/* Add Validate button for pending faults */}
                {fault.status === "pending" && (
                  <button 
                    onClick={() => validateFault(fault._id)} 
                    className="validate-btn"
                  >
                    Validate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClaimFaults;
