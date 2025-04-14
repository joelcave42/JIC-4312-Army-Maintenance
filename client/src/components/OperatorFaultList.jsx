import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { toast } from "react-toastify";
import Select from "react-select";

const OperatorFaultList = () => {
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const [partsByFault, setPartsByFault] = useState({});
  const username = localStorage.getItem("username");
  const [imageUrls, setImageUrls] = useState({});
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchVehicleId, setSearchVehicleId] = useState("");

  useEffect(() => {
    fetchFaults();
  }, []);

  const fetchFaults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/faults/operator/${username}`
      );
      const faultData = response.data.faults;
      console.log("Fault data structure:", faultData[0]);  // Debug log
      setFaults(faultData);

      faultData.forEach((fault) => {
        fetchPartsForFault(fault._id);
        fetchImageforFault(fault._id);
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your faults");
    }
  };

  const fetchPartsForFault = async (faultId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/parts?fault=${faultId}`
      );
      if (response.data.success) {
        const parts = response.data.data;
        setPartsByFault((prev) => ({ ...prev, [faultId]: parts }));
      }
    } catch (error) {
      console.error("Failed to fetch parts for fault:", error);
    }
  };

  const fetchImageforFault = async (faultId) => {
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

  const handleEditFault = (faultId) => {
    navigate(`/reopen-fault/${faultId}`);
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

  const filteredAndSortedFaults = [...faults]
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
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <h2>Your Fault Submissions</h2>

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
        {filteredAndSortedFaults.map((fault) => {
          const faultParts = partsByFault[fault._id] || [];

          return (
            <div
              key={fault._id}
              className={`fault-item ${
                fault.status === "deleted" ? "deleted-fault" : ""
              }`}
            >
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-date">Created on: {new Date(fault.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</p>

              {fault.status === "deleted" && (
                <div className="deleted-banner">
                  <p>DELETED</p>
                  <p className="deleted-info">
                    Deleted on:{" "}
                    {fault.deletedAt
                      ? new Date(fault.deletedAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Unknown date"}
                  </p>
                </div>
              )}

              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, index) => {
                  // Check if issue string follows the format "X - faultId" or "/ - faultId"
                  const isSeverityFormat = issue.match(/^([X/]) - (.+)$/);
                  const severity = isSeverityFormat ? isSeverityFormat[1] : null;
                  const issueText = isSeverityFormat ? isSeverityFormat[2] : issue;
                  
                  return (
                    <li key={index} className="issue-item">
                      {issueText}
                      {severity && (
                        <span className={`severity-badge ${severity === 'X' ? 'severity-x' : 'severity-slash'}`}>
                          {severity === 'X' ? 'X (Non-Mission Capable)' : '/ (Deficiency)'}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <p className="fault-status">
                <strong>Status:</strong>{" "}
                {fault.status === "deleted" ? "Deleted" : fault.status}
              </p>

              {fault.maintainerComment ? (
                <div className="maintainer-comment">
                  <p className="comment-label">Maintainer Notes:</p>
                  <p className="comment-content">{fault.maintainerComment}</p>
                </div>
              ) : (
                <div className="maintainer-comment">
                  <p className="comment-label">No maintainer notes yet</p>
                </div>
              )}

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

              <div className="parts-section">
                <h4 className="parts-title">Parts for this Fault:</h4>
                {faultParts.length === 0 ? (
                  <p>No parts ordered yet.</p>
                ) : (
                  <ul className="parts-list">
                    {faultParts.map((part) => (
                      <li key={part._id} className="part-item">
                        {part.partName} (Qty: {part.quantity}) — {part.status}
                        {part.status === "ARRIVED" && part.arrivedAt && (
                          <span>
                            {" "}
                            Arrived at:{" "}
                            {new Date(part.arrivedAt).toLocaleString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="edit-button-container">
                <button
                  className="edit-button"
                  onClick={() => handleEditFault(fault._id)}
                  disabled={fault.status === "deleted"}
                >
                  Edit Fault
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperatorFaultList;