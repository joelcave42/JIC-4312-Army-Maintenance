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

  // Fetch pending faults to display on the dashboard
  const fetchFaults = async () => {
    try {
      const response = await axios.get(`${faultsUrl}/pending`);
      setFaults(response.data.faults);
    } catch (error) {
      console.error(error);
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

  // Delete a fault
  const deleteFault = async (id) => {
    try {
      await axios.delete(`${faultsUrl}/${id}`);
      store.dispatch(changeStatusListener());
      toast.success("Fault successfully deleted");
    } catch (error) {
      toast.error(error.message);
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
              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    {issue}
                  </li>
                ))}
              </ul>
              <div className="fault-actions">
                <button onClick={() => deleteFault(fault._id)} className="delete-btn">
                  Delete
                </button>
                <button onClick={() => correctFault(fault._id)} className="correct-btn">
                  Fault Corrected
                </button>

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
    </div>
  );
};

export default FaultList;
