import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FaultList.css";
import { useSelector } from "react-redux";
import Select from "react-select";

const url = "http://localhost:3000/api/v1/faults/completed"; // Updated URL to fetch completed faults data

const CompletedFaultList = () => {
  const navigate = useNavigate();
  const [completedFaults, setCompletedFaults] = useState([]);
  const { statusListener } = useSelector((state) => state.globalValues);
  const [imageUrls, setImageUrls] = useState({});
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchVehicleId, setSearchVehicleId] = useState("");

  // Fetch corrected faults to display on dashboard
  const fetchCompletedFaults = async () => {
    try {
      const response = await axios.get(url);
      setCompletedFaults(response.data.faults);
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

  useEffect(() => {
    fetchCompletedFaults();
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

  const filteredAndSortedFaults = [...completedFaults]
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
      <button className="back-button" onClick={() => navigate("/home")}>Back</button>
      <div>
        <h2>Corrected Faults:</h2>
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
              <p className="vehicle-id">Vehicle ID: {fault.vehicleId}</p>
              <p className="fault-issues">Resolved Issues:</p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedFaultList;