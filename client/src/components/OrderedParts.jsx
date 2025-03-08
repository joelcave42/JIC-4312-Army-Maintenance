import React, { useState, useEffect } from "react";

const OrderedParts = () => {
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
        console.error("Error fetching parts:", data.message);
      }
    } catch (error) {
      console.error("Failed to fetch parts:", error);
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
          setMessage(`"${foundPart.partName}" marked as arrived!`);
        }
      } else {
        console.error("Error marking part as arrived:", data.message);
      }
    } catch (error) {
      console.error("Failed to mark part as arrived:", error);
    }
  };
  

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>All Ordered Parts</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      <hr />

      {allParts.length > 0 ? (
        <ul>
          {allParts.map((part) => {
            const orderedAt = part.orderedAt
              ? new Date(part.orderedAt).toLocaleString()
              : "N/A";
            const arrivedAt = part.arrivedAt
              ? new Date(part.arrivedAt).toLocaleString()
              : null;

            return (
              <li key={part._id} style={{ margin: "10px 0" }}>
                <strong>{part.partName}</strong> (Qty: {part.quantity})
                <br />
                Status:{" "}
                {part.status === "ORDERED" ? (
                  <span style={{ color: "#ffa500" }}>ORDERED</span>
                ) : (
                  <span style={{ color: "green" }}>ARRIVED</span>
                )}
                <br />
                Ordered At: {orderedAt}
                {arrivedAt && <div>Arrived At: {arrivedAt}</div>}

                {/* If it's still ORDERED, show button. Otherwise, show arrivedAt */}
                {part.status === "ORDERED" && (
                  <button
                    onClick={() => markAsArrived(part._id)}
                    style={{ marginTop: 8 }}
                  >
                    Mark as Arrived
                  </button>
                )}
                <hr />
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No parts found.</p>
      )}
    </div>
  );
};

export default OrderedParts;
