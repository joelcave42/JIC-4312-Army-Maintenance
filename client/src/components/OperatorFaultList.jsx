import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { toast } from "react-toastify";

const OperatorFaultList = () => {
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const username = localStorage.getItem("username");

  const fetchFaults = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/faults/operator/${username}`);
      setFaults(response.data.faults);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your faults");
    }
  };

  useEffect(() => {
    fetchFaults();
  }, []);

  return (
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>Back</button>
      <div>
        <h2>Your Fault Submissions</h2>
        <div className="fault-items">
          {faults.map((fault) => (
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
              <p>Status: {fault.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperatorFaultList;