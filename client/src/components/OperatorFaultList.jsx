import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { toast } from "react-toastify";

const OperatorFaultList = () => {
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const [partsByFault, setPartsByFault] = useState({}); // to store arrays of parts keyed by faultId
  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchFaults();
  }, []);

  // 1️⃣ Fetch the operator's faults (by username)
  const fetchFaults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/faults/operator/${username}`
      );
      const faultData = response.data.faults;
      setFaults(faultData);

      // 2️⃣ For each fault, fetch its parts
      faultData.forEach((fault) => {
        fetchPartsForFault(fault._id);
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your faults");
    }
  };

  // 2️⃣ For each fault, fetch parts referencing that fault
  const fetchPartsForFault = async (faultId) => {
    try {
      // Use the ?fault=faultId query param (your parts controller supports this)
      const response = await axios.get(
        `http://localhost:3000/api/v1/parts?fault=${faultId}`
      );

      if (response.data.success) {
        const parts = response.data.data; // array of PartOrder docs
        // Store them under this fault in our partsByFault state
        setPartsByFault((prev) => ({ ...prev, [faultId]: parts }));
      }
    } catch (error) {
      console.error("Failed to fetch parts for fault:", error);
    }
  };

  return (
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <div>
        <h2>Your Fault Submissions</h2>

        <div className="fault-items">
          {faults.map((fault) => {
            // The array of parts for this particular fault
            const faultParts = partsByFault[fault._id] || [];

            return (
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

                {/* 3️⃣ Display the parts associated with this fault */}
                <div style={{ marginTop: "10px" }}>
                  <h4>Parts for this Fault:</h4>
                  {faultParts.length === 0 ? (
                    <p>No parts ordered yet.</p>
                  ) : (
                    <ul>
                      {faultParts.map((part) => (
                        <li key={part._id}>
                          {part.partName} (Qty: {part.quantity}) — {part.status}
                          {part.status === "ARRIVED" && part.arrivedAt && (
                            <span>
                              &nbsp;Arrived at:{" "}
                              {new Date(part.arrivedAt).toLocaleString()}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OperatorFaultList;
