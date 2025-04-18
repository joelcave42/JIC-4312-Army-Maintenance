import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { changeStatusListener } from "../features/globalValues/globalSlice";
import { store } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";

const faultsUrl = "http://localhost:3000/api/v1/faults";  // To fetch/edit faults
const partsUrl = "http://localhost:3000/api/v1/parts";   // To create part orders

const FaultList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state for the displayed faults
  const [faults, setFaults] = useState([]);

  // Add username from localStorage to use for permission checks
  const currentUsername = localStorage.getItem("username");

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

  const [sortBy, setSortBy] = useState("date_desc");
  const [searchVehicleId, setSearchVehicleId] = useState("");

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

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "transparent",
      borderColor: "#FFD700",
      boxShadow: "none",
      color: "#FFD700",
      minHeight: "40px",
      "&:hover": { borderColor: "#FFD700" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1e2a1e",
      color: "#FFD700",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "rgba(255, 215, 0, 0.2)" : "transparent",
      color: "#FFD700",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#FFD700",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#FFD700",
    }),
  };

  const filteredAndSortedFaults = [...faults]
  .filter((fault) =>
    fault.vehicleId.toLowerCase().includes(searchVehicleId.toLowerCase())
  )
  .sort((a, b) => {
    let comparison = 0;

    if (sortBy === "vehicleId") {
        comparison = a.vehicleId.localeCompare(b.vehicleId);
        if (comparison === 0) {
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
        }
    } else if (sortBy === "date_asc") {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        if (comparison === 0) {
          comparison = a.vehicleId.localeCompare(b.vehicleId);
        }
    } else if (sortBy === "date_desc") {
        comparison = new Date(b.createdAt) - new Date(a.createdAt);
        if (comparison === 0) {
          comparison = a.vehicleId.localeCompare(b.vehicleId);
        }
    }
    return comparison;
  });

  return (
    <div className="fault-list-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>

      <div>
        <h2>Fault Submissions:</h2>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "20px", width: "100%" }}>
            <span style={{ color: "#FFD700" }}>Sort By:</span>
            <div style={{ width: "200px" }}>
            <Select
                options={[
                { value: "vehicleId", label: "Vehicle ID" },
                { value: "status", label: "Status" },
                { value: "date_asc", label: "Date (Ascending)" },
                { value: "date_desc", label: "Date (Descending)" },
                ]}
                value={{ value: sortBy, label: {
                vehicleId: "Vehicle ID",
                status: "Status",
                date_asc: "Date (Ascending)",
                date_desc: "Date (Descending)"
                }[sortBy] }}
                onChange={(selected) => setSortBy(selected.value)}
                placeholder="Sort By"
                styles={selectStyles}
            />
            </div>
            <input
            type="text"
            placeholder="Search by vehicle id"
            value={searchVehicleId}
            onChange={(e) => setSearchVehicleId(e.target.value)}
            style={{
                backgroundColor: "#1e2a1e",
                border: "1px solid #FFD700",
                color: "#FFD700",
                padding: "8px",
                borderRadius: "4px",
                outline: "none",
                height: "40px",
                flexGrow: 1,
                width: "100%",
                minWidth: "200px",
                '::placeholder': { color: "rgba(255, 215, 0, 0.6)" },
            }}
            />
      </div>
        <div className="fault-items">
          {filteredAndSortedFaults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <div className="vehicle-id">Vehicle ID: {fault.vehicleId}</div>
              <div className="fault-creator">
                <span className="creator-label">Created by: </span>
                <span className="creator-name">{fault.createdBy || "Unknown"}</span>
              </div>
              <div className="fault-date">
                <span className="date-label">Created on: </span>
                <span className="date-value">{new Date(fault.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
              </div>
              <div className="fault-status">
                <span className="status-label">Status: </span>
                <span className="status-value">{fault.status}</span>
              </div>
              <div className="fault-issues">
                <span className="issues-label">Issue: </span>
              </div>
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
                {/* Show buttons or view-only message */}
                {(userType !== "operator" || fault.createdBy === currentUsername) ? (
                  <>
                    <button onClick={() => deleteFault(fault._id)} className="delete-btn">
                      Delete
                    </button>
                    <button onClick={() => correctFault(fault._id)} className="correct-btn">
                      Fault Corrected
                    </button>
                  </>
                ) : (
                  <div className="view-only-message">
                    This fault is view-only. Contact the creator for changes.
                  </div>
                )}

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
                    className="order-parts-btn"
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
