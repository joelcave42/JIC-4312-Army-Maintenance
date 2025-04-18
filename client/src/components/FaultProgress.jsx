// src/components/FaultProgress.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../styles/FaultProgress.css";
import "../styles/ClaimedFaults.css";

const FaultProgress = () => {
  const navigate = useNavigate();

  // Summary state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // Stagnant faults UI state
  const [showStagnant, setShowStagnant] = useState(false);
  const [stagnantFaults, setStagnantFaults] = useState([]);
  const [stagnantCount, setStagnantCount] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [searchVehicleId, setSearchVehicleId] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

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
      backgroundColor: state.isFocused
        ? "rgba(255, 215, 0, 0.2)"
        : "transparent",
      color: "#FFD700",
    }),
    singleValue: (base) => ({ ...base, color: "#FFD700" }),
    placeholder: (base) => ({ ...base, color: "#FFD700" }),
  };

  // Fetch the stagnant count on mount
  useEffect(() => {
    const fetchStagnantCount = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/v1/faults/stagnant"
        );
        setStagnantCount(data.count);
      } catch (err) {
        console.error("Error fetching stagnant count:", err);
      }
    };
    fetchStagnantCount();
  }, []);

  // Fetch summary by date range
  const fetchSummary = async () => {
    if (!startDate || !endDate) {
      setError("Please select both dates.");
      setSummary(null);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      setSummary(null);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:3000/api/v1/faults/summary/by-date?start=${startDate}&end=${endDate}`
      );
      setSummary(data);
      setError("");
    } catch {
      setError("Failed to fetch summary.");
      setSummary(null);
    }
  };

  // Fetch stagnant faults when toggled open
  const fetchStagnantFaults = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/v1/faults/stagnant"
      );
      setStagnantFaults(data.faults);
      data.faults.forEach((fault) => fetchImageForFault(fault._id));
    } catch (err) {
      console.error("Error fetching stagnant faults:", err);
    }
  };

  useEffect(() => {
    if (showStagnant) fetchStagnantFaults();
  }, [showStagnant]);

  // Helper to fetch each fault’s image blob
  const fetchImageForFault = async (faultId) => {
    try {
      const resp = await axios.get(
        `http://localhost:3000/api/v1/faults/${faultId}/image`,
        { responseType: "blob" }
      );
      setImageUrls((prev) => ({
        ...prev,
        [faultId]: URL.createObjectURL(resp.data),
      }));
    } catch {
      // no image
    }
  };

  // Filter & sort logic
  const filteredAndSorted = [...stagnantFaults]
    .filter((f) =>
      f.vehicleId.toLowerCase().includes(searchVehicleId.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "vehicleId") {
        cmp = a.vehicleId.localeCompare(b.vehicleId);
        if (!cmp) cmp = new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "status") {
        cmp = a.status.localeCompare(b.status);
        if (!cmp) cmp = new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "date_asc") {
        cmp = new Date(a.createdAt) - new Date(b.createdAt);
        if (!cmp) cmp = a.vehicleId.localeCompare(b.vehicleId);
      } else if (sortBy === "date_desc") {
        cmp = new Date(b.createdAt) - new Date(a.createdAt);
        if (!cmp) cmp = a.vehicleId.localeCompare(b.vehicleId);
      }
      return cmp;
    });

  return (
    <div className="fault-progress-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <h2 className="fault-progress-title">Fault Progress Overview</h2>

      {stagnantCount !== null && (
        <p className="stagnant-count">
          Number of Stagnant Faults: {stagnantCount}
        </p>
      )}

      {/* Date‑range summary */}
      <div className="date-inputs">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <button className="fetch-button" onClick={fetchSummary}>
          Get Summary
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {summary && (
        <div className="summary-results">
          <p>
            <strong>Completed Faults:</strong> {summary.completedCount}
          </p>
          <p>
            <strong>Created Faults:</strong> {summary.createdCount}
          </p>
          <p>
            <strong>Still Open Faults:</strong> {summary.stillOpenCount}
          </p>
        </div>
      )}

      {/* Toggle Stagnant Faults section */}
      <button
        className="toggle-stagnant-button"
        onClick={() => setShowStagnant((prev) => !prev)}
      >
        {showStagnant ? "Hide Stagnant Faults" : "Show Stagnant Faults"}
      </button>

      {showStagnant && (
        <div className="claimed-faults-main" style={{ marginTop: "20px" }}>
          <h2 className="claimed-faults-title">Stagnant Faults</h2>

          {/* Search & Sort controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
              gap: "20px",
              width: "100%",
            }}
          >
            <span style={{ color: "#FFD700" }}>Sort By:</span>
            <div style={{ width: "200px" }}>
              <Select
                options={[
                  { value: "vehicleId", label: "Vehicle ID" },
                  { value: "status", label: "Status" },
                  { value: "date_asc", label: "Date (Asc)" },
                  { value: "date_desc", label: "Date (Desc)" },
                ]}
                value={{
                  value: sortBy,
                  label: {
                    vehicleId: "Vehicle ID",
                    status: "Status",
                    date_asc: "Date (Asc)",
                    date_desc: "Date (Desc)",
                  }[sortBy],
                }}
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
                minWidth: "200px",
              }}
            />
          </div>

          {/* Fault cards grid */}
          <div className="fault-items">
            {filteredAndSorted.length === 0 ? (
              <p>No stagnant faults found.</p>
            ) : (
              filteredAndSorted.map((fault) => (
                <div key={fault._id} className="fault-item">
                  <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
                  <p className="fault-created">
                    <strong>Created By:</strong> {fault.createdBy}
                  </p>
                  <p className="fault-claimed">
                    <strong>Claimed By:</strong> {fault.claimedBy}
                  </p>
                  <p className="fault-date">
                    Updated: {new Date(fault.lastUpdatedAt).toLocaleString()}
                  </p>
                  <p className="fault-status">
                    <strong>Status:</strong> {fault.status}
                  </p>
                  <p className="fault-issues">Issues:</p>
                  <ul className="issues-list">
                    {fault.issues.map((iss, i) => (
                      <li key={i} className="issue-item">
                        {iss}
                      </li>
                    ))}
                  </ul>
                  {imageUrls[fault._id] && (
                    <div className="fault-image-preview">
                      <img
                        src={imageUrls[fault._id]}
                        alt="fault"
                        className="preview-img"
                        style={{ maxWidth: "100%", maxHeight: "150px" }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaultProgress;
