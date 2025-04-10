import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { changeStatusListener } from "../features/globalValues/globalSlice";
import { store } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const faultsUrl = "http://localhost:3000/api/v1/faults";  // To fetch/edit faults
const partsUrl = "http://localhost:3000/api/v1/parts";   // To create part orders

const FaultList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state for the displayed faults
  const [faults, setFaults] = useState([]);

  // This tracks changes in your Redux store
  const { statusListener } = useSelector((state) => state.globalValues);

  // Identify user type and user ID
  const userType = localStorage.getItem("userType"); // e.g. "clerk"
  const userID = localStorage.getItem("userID");

  // States for the Part-Order Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedFaultId, setSelectedFaultId] = useState(null);

  // Part details
  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [recentlyDeletedFault, setRecentlyDeletedFault] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const [imageUrls, setImageUrls] = useState({});

  // Fetch pending faults to display on the dashboard
  const fetchFaults = async () => {
    try {
      const response = await axios.get(`${faultsUrl}/pending`);
      setFaults(response.data.faults);
      response.data.faults.forEach((fault) => fetchImageForFault(fault._id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchImageForFault = async (faultId) => {
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
  

  // Show the Order Part modal for a specific fault
  const handleOpenOrderModal = (faultId) => {
    setSelectedFaultId(faultId);
    setShowOrderModal(true);
  };

  // Close the modal without ordering
  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedFaultId(null);
    setPartName("");
    setQuantity(1);
  };

  // Actually order a part
  const orderPartForFault = async (faultId) => {
    if (!userID) {
      toast.error("No userID found. Are you logged in?");
      return;
    }

    try {
      const response = await axios.post(partsUrl, {
        partName,
        quantity,
        userID,
        fault: faultId, // link to this specific fault
      });
      if (response.data.success) {
        toast.success("Part ordered successfully!");
        // Close the modal and reset fields
        handleCloseOrderModal();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to order part. " + error.message);
    }
  };


  const deleteFault = async (id) => {
    try {
      const response = await axios.delete(`${faultsUrl}/${id}`);
      const deletedFault = response.data.fault;
      setRecentlyDeletedFault(deletedFault);
      
      if (undoTimer) clearTimeout(undoTimer);
      const timer = setTimeout(() => {
        setRecentlyDeletedFault(null);
      }, 10000);
      setUndoTimer(timer);
      
      store.dispatch(changeStatusListener());
      toast.success("Fault successfully deleted. You have 10 seconds to undo.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const undoDeleteFault = async (id) => {
    try {
      await axios.patch(`${faultsUrl}/${id}/undo-delete`);
      store.dispatch(changeStatusListener());
      toast.success("Fault restored successfully");
      setRecentlyDeletedFault(null);
      if (undoTimer) {
        clearTimeout(undoTimer);
        setUndoTimer(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to restore fault");
    }
  };

  // Mark a fault as corrected
  const correctFault = async (id) => {
    try {
      await axios.patch(`${faultsUrl}/${id}/correct`);
      setFaults((prev) => prev.filter((fault) => fault._id !== id));
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as corrected");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Mark a fault as validated
  const validateFault = async (id) => {
    try {
      const response = await axios.patch(`${faultsUrl}/${id}/validated`);
      
      // Update the fault in the local state
      setFaults((prev) => 
        prev.map((fault) => 
          fault._id === id ? { ...fault, status: "validated" } : fault
        )
      );
      
      store.dispatch(changeStatusListener());
      toast.success("Fault validated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to validate fault");
    }
  };

  useEffect(() => {
    fetchFaults();
  }, [statusListener]);

  return (
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <div>
        <h2>Fault Submissions:</h2>
        <div className="fault-items">
          {faults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-status"><strong>Status:</strong> {fault.status}</p>
              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    {issue}
                  </li>
                ))}
              </ul>
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
              <div className="fault-actions">
                <button onClick={() => deleteFault(fault._id)} className="delete-btn">
                  Delete
                </button>
                <button onClick={() => correctFault(fault._id)} className="correct-btn">
                  Fault Corrected
                </button>

                {/* Add Validate button for clerks, supervisors, or maintainers, but only for pending faults */}
                {(userType === "clerk" || userType === "supervisor" || userType === "maintainer") && fault.status === "pending" && (
                  <button 
                    onClick={() => validateFault(fault._id)} 
                    className="validate-btn"
                  >
                    Validate
                  </button>
                )}

                {/* If user is a clerk, show "Order Parts" button */}
                {userType === "clerk" && (
                  <button
                    onClick={() => handleOpenOrderModal(fault._id)}
                    style={{ marginTop: "10px" }}
                  >
                    Order Parts
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP / MODAL FOR ORDERING PARTS */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Order Part</h3>
            <label style={{ display: "block", marginBottom: 8 }}>
              Part Name:
              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                style={{ marginLeft: 5 }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Quantity:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{ marginLeft: 5 }}
              />
            </label>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => orderPartForFault(selectedFaultId)}
                style={{ marginRight: 10 }}
              >
                Submit
              </button>
              <button onClick={handleCloseOrderModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Button for recently deleted fault */}
      {recentlyDeletedFault && (
        <div
          className="undo-container"
          style={{
            margin: "20px auto",
            padding: "10px",
            background: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "5px",
            textAlign: "center",
            width: "90%",
            maxWidth: "600px",
          }}
        >
          <p>
            Fault has been deleted, but can be undone. Click below within 10 seconds to restore
            the fault.
          </p>
          <button
            className="undo-btn"
            style={{
              padding: "8px 16px",
              background: "#c82333",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => undoDeleteFault(recentlyDeletedFault._id)}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
};

export default FaultList;
