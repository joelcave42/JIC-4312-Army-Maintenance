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
      
      // Add debugging logs
      console.log('Fetched operator faults:', faultData);
      console.log('Sample fault deletedAt:', faultData[0]?.deletedAt);
      
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
              <div key={fault._id} className={`fault-item ${fault.status === 'deleted' ? 'deleted-fault' : ''}`}>
                <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
                {fault.status === 'deleted' && (
                    <div className="deleted-banner">
                        <p>DELETED</p>
                        <p className="deleted-info">
                            Deleted on: {fault.deletedAt ? new Date(fault.deletedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : 'Unknown date'}
                        </p>
                    </div>
                )}
                <p className="fault-issues">Issues:</p>
                <ul className="issues-list">
                  {fault.issues.map((issue, index) => (
                    <li key={index} className="issue-item">
                      {issue}
                    </li>
                  ))}
                </ul>
                <p className="fault-status">
                  <strong>Status:</strong> {fault.status === 'deleted' ? 'Deleted' : fault.status}
                </p>

                {/* Display maintainer comments if available */}
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

                {/* 3️⃣ Display the parts associated with this fault */}
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
