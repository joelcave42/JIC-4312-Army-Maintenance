import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";
import "../styles/ClaimFaults.css"; 



const AssignFaults = () => {
  const navigate = useNavigate();

  const [faults, setFaults] = useState([]);
  const [maintainers, setMaintainers] = useState([]);
  const [selectedMaintainerMap, setSelectedMaintainerMap] = useState({});

  useEffect(() => {
    fetchUnassignedFaults();
    fetchMaintainers();
  }, []);

  // 1) Fetch unassigned faults
  const fetchUnassignedFaults = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/v1/faults");
      if (data.faults && Array.isArray(data.faults)) {
        const unassigned = data.faults.filter(
          (fault) => fault.status !== "completed" && fault.isClaimed === false
        );
        setFaults(unassigned);
      }
    } catch (error) {
      toast.error("Error fetching faults");
      console.error(error);
    }
  };

  // 2) Fetch active maintainers
  const fetchMaintainers = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/v1/accounts");
      const allUsers = data.data || [];
      const activeMaintainers = allUsers.filter(
        (user) => user.accountType === "maintainer" && user.isActive
      );

      setMaintainers(
        activeMaintainers.map((m) => ({
          value: m._id,
          label: m.username,
        }))
      );
    } catch (error) {
      toast.error("Error fetching maintainers");
      console.error(error);
    }
  };

  // 3) Assign
  const handleAssign = async (faultID) => {
    try {
      const selectedMaintainer = selectedMaintainerMap[faultID];
      if (!selectedMaintainer) {
        toast.error("Please select a maintainer before assigning.");
        return;
      }
      await axios.patch(`http://localhost:3000/api/v1/faults/${faultID}/claim`, {
        maintainerID: selectedMaintainer.value,
      });
      toast.success("Fault assigned successfully!");
      setFaults((prev) => prev.filter((f) => f._id !== faultID));
    } catch (error) {
      toast.error("Error assigning fault");
      console.error(error);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "white",
      color: "black",
      borderColor: "#ccc",
      "&:hover": { borderColor: "#ccc" },
    }),
    menu: (base) => ({
      ...base,
      color: "black",
      backgroundColor: "white",
    }),
    option: (base, state) => ({
      ...base,
      color: "black",
      backgroundColor: state.isFocused ? "#e6e6e6" : "white",
    }),
    singleValue: (base) => ({
      ...base,
      color: "black",
    }),
  };

  return (
    <div className="claim-faults-main">
      <button className="back-button" onClick={() => navigate("/supervisor-dashboard")}>
        Back
      </button>

      <h2 className="claim-faults-title">Assign Faults to Maintainers</h2>

      <div className="fault-items">
        {faults.length === 0 ? (
          <p>No unassigned faults found.</p>
        ) : (
          faults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, i) => (
                  <li key={i} className="issue-item">
                    {issue}
                  </li>
                ))}
              </ul>

              <div style={{ margin: "10px 0" }}>
                <Select
                  options={maintainers}
                  placeholder="Select Maintainer"
                  isClearable
                  value={selectedMaintainerMap[fault._id] || null}
                  onChange={(option) =>
                    setSelectedMaintainerMap((prev) => ({
                      ...prev,
                      [fault._id]: option,
                    }))
                  }
                  
                  styles={selectStyles}
               
                  theme={(originalTheme) => ({
                    ...originalTheme,
                    colors: {
                      ...originalTheme.colors,
                     
                      neutral0: "white",
                   
                      neutral80: "black",
                     
                      primary: "#2a362a",   
                      primary25: "#e6e6e6" 
                    },
                  })}
                />
              </div>

              <div className="fault-actions">
                <button onClick={() => handleAssign(fault._id)} className="correct-btn">
                  Assign Fault
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignFaults;
