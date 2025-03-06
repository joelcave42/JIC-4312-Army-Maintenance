import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ClaimFaults.css"; // Using same styles as ClaimFaults
import { changeStatusListener } from "../features/globalValues/globalSlice";
import { store } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const ClaimedFaults = () => {
  const navigate = useNavigate();
  const [faults, setFaults] = useState([]);
  const dispatch = useDispatch();
  const maintainerID = localStorage.getItem("userID");
  const { statusListener } = useSelector((state) => state.globalValues);

  const fetchClaimedFaults = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/faults");
      
      // Filter only the faults that are claimed AND claimedBy the current maintainer
      const claimed = response.data.faults.filter((fault) => {
        const isNotCompleted = Array.isArray(fault.status)
            ? !fault.status.includes("completed")
            : fault.status !== "completed";
        const isClaimedByMe = fault.claimedBy === maintainerID;

        return fault.isClaimed && isNotCompleted && isClaimedByMe;
      });

      setFaults(claimed);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching claimed faults");
    }
  };
  const deleteFault = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/faults/${id}`);
      setFaults((prevFaults) => prevFaults.filter((fault) => fault._id !== id));
      store.dispatch(changeStatusListener());
      toast.success("Fault successfully deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };
  const markFaultInProgress = async (id) => {
    try {
      console.log("Marking fault in progress with ID:", id);
      console.log(`Send PATCH request to: http://localhost:3000/api/v1/faults/${id}/in-progress`);
      
      await axios.patch(`http://localhost:3000/api/v1/faults/${id}/in-progress`);
      
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as in progress");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markFaultAwaitingPart = async (id) => {
    try {
      console.log("Marking fault awaiting part with ID:", id);
      console.log(`Send PATCH request to: http://localhost:3000/api/v1/faults/${id}/awaiting-part`);
      
      await axios.patch(`http://localhost:3000/api/v1/faults/${id}/awaiting-part`);
      
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as awaiting part");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const correctFault = async (id) => {
    try {
      console.log("Correcting fault with ID:", id);
      console.log(`Send PATCH request to: http://localhost:3000/api/v1/faults/${id}/correct`);
      
      await axios.patch(`http://localhost:3000/api/v1/faults/${id}/correct`);
      
      // Remove the corrected fault from the UI
      setFaults((prevFaults) => prevFaults.filter((fault) => fault._id !== id));
      
      store.dispatch(changeStatusListener());
      toast.success("Fault marked as corrected");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchClaimedFaults();
  }, [statusListener]);

  return (
    <div className="claim-faults-main">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      <div>
        <h2 className="claim-faults-title">My Claimed Faults</h2>

        <div className="fault-list-container">
          <div className="fault-items">
            {faults.length === 0 ? (
              <p>No claimed faults found.</p>
            ) : (
              faults.map((fault) => (
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
                  <div className="fault-actions">
                    <button
                      onClick={() => deleteFault(fault._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => correctFault(fault._id)}
                      className="correct-btn"
                    >
                      Fault Corrected
                    </button>
                    {fault.status === "pending" && (
                        <button
                            onClick={() => markFaultInProgress(fault._id)}
                            className="status-btn"
                        >
                            Mark In Progress
                        </button> 
                    )}
                    {fault.status === "in progress" && (
                        <button
                            onClick={() => markFaultAwaitingPart(fault._id)}
                            className="status-btn"
                        >
                            Mark Awaiting Part
                        </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimedFaults;
