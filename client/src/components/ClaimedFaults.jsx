import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ClaimedFaults.css"; // Using dedicated styles
import { changeStatusListener } from "../features/globalValues/globalSlice";
import { store } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";

const ClaimedFaults = () => {
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const [comments, setComments] = useState({}); // Store comments for each fault
  const dispatch = useDispatch();
  const maintainerID = localStorage.getItem("userID");
  const { statusListener } = useSelector((state) => state.globalValues);
  const [imageUrls, setImageUrls] = useState({});
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchVehicleId, setSearchVehicleId] = useState("");

  const fetchClaimedFaults = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/faults");  
      const claimed = response.data.faults.filter((fault) => {  
        const isClaimedByMe = fault.claimedBy === maintainerID;
        const isNotCompleted = fault.status !== "completed";
        const isDeleted = fault.status === "deleted";
        if (!maintainerID) {
          return fault.isClaimed && isNotCompleted;
        }
        return (
          (fault.isClaimed && isClaimedByMe && isNotCompleted) ||
          (isDeleted && fault.deletedBy === maintainerID)
        );
      });  
      setFaults(claimed);
      claimed.forEach((fault) => fetchImageForFault(fault._id));
    } catch (error) {
      console.error("[ERROR] Fetching claimed faults:", error);
      toast.error("Error fetching claimed faults");
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
  
  
  const deleteFault = async (id) => {
    try {
      const userID = localStorage.getItem("userID");
      const response = await axios.delete(`http://localhost:3000/api/v1/faults/${id}`, {
        data: { userID }
      });
      
      // Add debugging logs
      console.log('Delete response:', response.data);
      console.log('Updated fault:', response.data.fault);
      
      // Use the returned fault data from the response
      const updatedFault = response.data.fault;
      
      // Update the state with the returned fault data
      setFaults(prevFaults => prevFaults.map(fault => {
        if (fault._id === id) {
          return updatedFault;
        }
        return fault;
      }));
      
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as deleted");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
    }
  };
  
  const markFaultInProgress = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/faults/${id}/in-progress`);
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as in progress");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markFaultAwaitingPart = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/faults/${id}/awaiting-part`);
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as awaiting part");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add the validateFault function
  const validateFault = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3000/api/v1/faults/${id}/validated`);
      
      // Update the fault in the local state
      setFaults((prevFaults) => 
        prevFaults.map((fault) => 
          fault._id === id ? { ...fault, status: "validated" } : fault
        )
      );
      
      store.dispatch(changeStatusListener());
      toast.success("Fault validated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to validate fault");
    }
  };

  const correctFault = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/faults/${id}/correct`);
      
      // Remove the corrected fault from the UI
      setFaults((prevFaults) => prevFaults.filter((fault) => fault._id !== id));
      
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as corrected");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add a new function to handle comment updates
  const handleCommentChange = (faultId, value) => {
    setComments({
      ...comments,
      [faultId]: value
    });
  };

  // Add a function to save comments
  const saveComment = async (faultId) => {
    try {
      if (!comments[faultId] || comments[faultId].trim() === '') {
        toast.warning("Please enter a comment before saving");
        return;
      }

      // Add this console log to see the exact URL being called
      const url = `http://localhost:3000/api/v1/faults/${faultId}/comment`;
      console.log('Attempting to save comment to URL:', url);
      
      const response = await axios.patch(url, {
        comment: comments[faultId]
      });
      
      console.log('Comment save response:', response.data);
      
      // Update the local state to reflect the change
      setFaults(prevFaults => prevFaults.map(fault => {
        if (fault._id === faultId) {
          return {
            ...fault,
            maintainerComment: comments[faultId]
          };
        }
        return fault;
      }));
      
      // Clear the input field after saving
      setComments({
        ...comments,
        [faultId]: ''
      });
      
      store.dispatch(changeStatusListener());
      toast.success("Comment saved successfully");
    } catch (error) {
      console.error('Error saving comment:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed to save comment: ${error.response?.data?.msg || error.message}`);
    }
  };

  useEffect(() => {
    fetchClaimedFaults();
  }, [statusListener]);

  // Initialize comments from fetched faults
  useEffect(() => {
    const initialComments = {};
    faults.forEach(fault => {
      initialComments[fault._id] = fault.maintainerComment || '';
    });
    setComments(initialComments);
  }, [faults]);

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
    <div className="claimed-faults-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      <div>
        <h2 className="claimed-faults-title">My Claimed Faults</h2>

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
          {filteredAndSortedFaults.length === 0 ? (
            <p>No claimed faults found.</p>
          ) : (
            filteredAndSortedFaults.map((fault) => (
              <div key={fault._id} className={`fault-item ${fault.status === 'deleted' ? 'deleted-fault' : ''}`}>
                <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
                <p className="fault-date">Created: {new Date(fault.createdAt).toLocaleDateString()}</p>
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

                
                {/* Comment section */}
                <div className="comment-section">
                  <p className="comment-label">Maintainer Notes:</p>
                  <div className="comment-input-container">
                    <input
                      type="text"
                      className="comment-input"
                      placeholder="Add a note for the operator..."
                      value={comments[fault._id] || ''}
                      onChange={(e) => handleCommentChange(fault._id, e.target.value)}
                      maxLength={100}
                    />
                    <button 
                      className="action-btn comment-btn"
                      onClick={() => saveComment(fault._id)}
                    >
                      Save
                    </button>
                  </div>
                  {fault.maintainerComment && (
                    <p className="current-comment">
                      <strong>Current note:</strong> {fault.maintainerComment}
                    </p>
                  )}
                </div>
                
                <div className="fault-actions">
                  <button
                    onClick={() => deleteFault(fault._id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => correctFault(fault._id)}
                    className="action-btn correct-btn"
                  >
                    Corrected
                  </button>
                  
                  {/* Add Validate button for pending faults */}
                  {fault.status === "pending" && (
                    <button
                      onClick={() => validateFault(fault._id)}
                      className="action-btn validate-btn"
                    >
                      Validate
                    </button>
                  )}
                  
                  {(fault.status === "pending" || fault.status === "validated") && (
                    <button
                      onClick={() => markFaultInProgress(fault._id)}
                      className="action-btn status-btn"
                    >
                      In Progress
                    </button> 
                  )}
                  {fault.status === "in progress" && (
                    <button
                      onClick={() => markFaultAwaitingPart(fault._id)}
                      className="action-btn status-btn"
                    >
                      Awaiting Part
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimedFaults;
