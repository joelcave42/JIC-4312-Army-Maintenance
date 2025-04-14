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
  const [imageUrls, setImageUrls] = useState({});
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchVehicleId, setSearchVehicleId] = useState("");

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
        unassigned.forEach((fault) => fetchImageForFault(fault._id));
      }
    } catch (error) {
      toast.error("Error fetching faults");
      console.error(error);
    }
  };

  const fetchImageForFault = async (faultId) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/v1/faults/${faultId}/image`, {responseType: "blob"});
        const imageURL = URL.createObjectURL(response.data);
        setImageUrls((prev) => ({ ...prev, [faultId]: imageURL}));
    } catch (error) {
        console.warn(`No image for fault ${faultId}`);
    }
  }

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
    <div className="claim-faults-main">
      <button className="back-button" onClick={() => navigate("/supervisor-dashboard")}>Back</button>

      <h2 className="claim-faults-title">Assign Faults to Maintainers</h2>

      <div className="filters-section" style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "20px" }}>
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
            width: "200px",
            '::placeholder' :{
                color: "rgba(255, 215, 0, 0.6)",
            },
          }}
        />
      </div>

      <div className="fault-items">
        {filteredAndSortedFaults.length === 0 ? (
          <p>No unassigned faults found.</p>
        ) : (
          filteredAndSortedFaults.map((fault) => (
            <div key={fault._id} className="fault-item">
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-date">Created: {new Date(fault.createdAt).toLocaleDateString()}</p>
              <p className="fault-status">Status: {fault.status}</p>
              <p className="fault-issues">Issues:</p>
              <ul className="issues-list">
                {fault.issues.map((issue, i) => (
                  <li key={i} className="issue-item">{issue}</li>
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
                      primary25: "#e6e6e6",
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
