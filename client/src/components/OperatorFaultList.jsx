import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { toast } from "react-toastify";

const OperatorFaultList = () => {
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const [partsByFault, setPartsByFault] = useState({});
  const username = localStorage.getItem("username");
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    fetchFaults();
  }, []);

  const fetchFaults = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/faults/operator/${username}`
      );
      const faultData = response.data.faults;
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

  return (
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <h2>Your Fault Submissions</h2>

      <div className="fault-items">
        {faults.map((fault) => {
          const faultParts = partsByFault[fault._id] || [];

          return (
            <div
              key={fault._id}
              className={`fault-item ${
                fault.status === "deleted" ? "deleted-fault" : ""
              }`}
            >
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>

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
                {fault.issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    {issue}
                  </li>
                ))}
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