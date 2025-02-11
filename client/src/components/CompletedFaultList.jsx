import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { useSelector } from "react-redux";

const url = "http://localhost:3000/api/v1/faults/completed"; // Updated URL to fetch completed faults data

const CompletedFaultList = () => {
  const navigate = useNavigate();
  const [completedFaults, setCompletedFaults] = useState([]);
  const { statusListener } = useSelector((state) => state.globalValues);

  const fetchCompletedFaults = async () => {
    try {
      const response = await axios.get(url);
      setCompletedFaults(response.data.faults);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCompletedFaults();
  }, [statusListener]);

  return (
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>Back</button>
      <div>
        <h2>Corrected Faults:</h2>
        <div className="fault-items">
          {completedFaults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-issues">Resolved Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedFaultList;