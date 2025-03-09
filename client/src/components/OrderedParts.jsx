import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/OrderedParts.css";

const OrderedParts = () => {
  const navigate = useNavigate();
  const [allParts, setAllParts] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch *all* parts (ordered + arrived) on mount
  useEffect(() => {
    fetchAllParts();
  }, []);

  const fetchAllParts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/parts");
      const data = await response.json();
      if (data.success) {
        setAllParts(data.data);
      } else {
        toast.error("Error fetching parts");
      }
    } catch (error) {
      toast.error("Failed to fetch parts");
    }
  };

  const markAsArrived = async (partId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/parts/${partId}/arrive`, {
        method: "PATCH",
      });
      const data = await response.json();
  
      if (data.success) {
        // Grab the part from our local state
        const foundPart = allParts.find((p) => p._id === partId);
  
        // Update local state to reflect ARRIVED
        setAllParts((prevParts) =>
          prevParts.map((p) =>
            p._id === partId
              ? { ...p, status: "ARRIVED", arrivedAt: new Date().toISOString() }
              : p
          )
        );
  
        // Use the found part's name in the message
        if (foundPart) {
          toast.success(`"${foundPart.partName}" marked as arrived!`);
        }
      } else {
        toast.error("Error marking part as arrived");
      }
    } catch (error) {
      toast.error("Failed to mark part as arrived");
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="ordered-parts-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      
      <h2 className="ordered-parts-title">All Ordered Parts</h2>

      <div className="parts-grid">
        {allParts.length === 0 ? (
          <p className="no-parts">No parts found.</p>
        ) : (
          allParts.map((part) => (
            <div key={part._id} className={`part-card ${part.status.toLowerCase()}`}>
              <div className="part-header">
                <h3 className="part-name">{part.partName}</h3>
                <span className={`status-badge ${part.status.toLowerCase()}`}>
                  {part.status}
                </span>
              </div>

              <div className="part-details">
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{part.quantity}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Ordered:</span>
                  <span className="detail-value">{formatDate(part.orderedAt)}</span>
                </div>

                {part.arrivedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Arrived:</span>
                    <span className="detail-value">{formatDate(part.arrivedAt)}</span>
                  </div>
                )}
              </div>

              {part.status === "ORDERED" && (
                <button
                  className="arrive-button"
                  onClick={() => markAsArrived(part._id)}
                >
                  Mark as Arrived
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderedParts;
