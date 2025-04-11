import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/FaultProgress.css";

const FaultProgress = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    if (!startDate || !endDate) {
      setError("Please select both a start and end date.");
      setSummary(null);
      return;
    }
  
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      setSummary(null);
      return;
    }
  
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/faults/summary/by-date?start=${startDate}&end=${endDate}`
      );
      setSummary(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch summary.");
      setSummary(null);
    }
  };
  

  return (
    <div className="fault-progress-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <h2 className="fault-progress-title">Fault Progress Overview</h2>

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
          <p><strong>Completed Faults:</strong> {summary.completedCount}</p>
          <p><strong>Created Faults:</strong> {summary.createdCount}</p>
          <p><strong>Still Open Faults:</strong> {summary.stillOpenCount}</p>
        </div>
      )}
    </div>
  );
};

export default FaultProgress;
