import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SoldierRoster.css";
import { toast } from "react-toastify";
import Select from "react-select";

const SoldierRoster = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [companyChanges, setCompanyChanges] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/accounts");
      setAccounts(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching accounts");
    }
  };

  const handleCompanyChange = (userId, newCompany) => {
    setCompanyChanges({ ...companyChanges, [userId]: newCompany });
  };

  const updateCompany = async (userId) => {
    try {
      const requesterId = localStorage.getItem("userID");

      await axios.patch("http://localhost:3000/api/v1/accounts/company", {
        requesterId,
        userId,
        newCompany: companyChanges[userId],
      });

      toast.success("Company updated successfully!");
      fetchAccounts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating company");
    }
  };

  const filteredAccounts = accounts.filter((account) =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAccounts = filteredAccounts.sort((a, b) => {
    const companyA = (a.company || "").toLowerCase();
    const companyB = (b.company || "").toLowerCase();
    const roleA = (a.accountType || "").toLowerCase();
    const roleB = (b.accountType || "").toLowerCase();

    if (sortOption === "company") {
      if (companyA !== companyB) return companyA.localeCompare(companyB);
      return roleA.localeCompare(roleB);
    }

    if (sortOption === "role") {
      return roleA.localeCompare(roleB);
    }

    return 0;
  });

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

  return (
    <div className="soldier-roster-main">
      <button className="back-button" onClick={() => navigate("/supervisor-dashboard")}>
        Back
      </button>

      <h2 className="soldier-roster-title">Soldier Roster</h2>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "20px", width: "100%" }}>
        <span style={{ color: "#FFD700" }}>Sort By:</span>
        <div style={{ width: "200px" }}>
          <Select
            options={[
              { value: "company", label: "Company" },
              { value: "role", label: "Role" },
            ]}
            value={{ value: sortOption, label: { company: "Company", role: "Role" }[sortOption] }}
            onChange={(selected) => setSortOption(selected.value)}
            placeholder="Sort By"
            styles={selectStyles}
          />
        </div>

        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Accounts Display */}
      <div className="account-items">
        {sortedAccounts.length === 0 ? (
          <p>No accounts found.</p>
        ) : (
          sortedAccounts.map((account) => (
            <div key={account._id} className="account-item">
              <p>
                <span style={{ color: "#FFD700" }}>Username:</span>{" "}
                <span style={{ color: "#fff" }}>{account.username}</span>
              </p>
              <p>
                <span style={{ color: "#FFD700" }}>Role:</span>{" "}
                <span style={{ color: "#fff" }}>{account.accountType}</span>
              </p>
              <p>
                <span style={{ color: "#FFD700" }}>Company:</span>{" "}
                <span style={{ color: "#fff" }}>{account.company}</span>
              </p>

              <div className="company-update-section" style={{ display: "inline-block", gap: "8px", alignItems: "center", }}>
                <input
                  type="text"
                  placeholder="New company name"
                  value={companyChanges[account._id] || ""}
                  onChange={(e) => handleCompanyChange(account._id, e.target.value)}
                  className="company-input"
                  style={{
                    backgroundColor: "#1e2a1e",
                    border: "1px solid #FFD700",
                    color: "#FFD700",
                    padding: "0 8px",
                    borderRadius: "4px",
                    outline: "none",
                    width: "100%",
                    height: "40px",
                    lineHeight: "1",
                    fontSize: "16px",
                  }}
                />
                <button
                  className="action-btn update-btn"
                  onClick={() => updateCompany(account._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#FFD700",
                    color: "#2a362a",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    height: "40px",
                    whiteSpace: "nowrap",
                    padding: "0 16px",
                    lineHeight: "1",
                    fontSize: "14px",
                  }}
                >
                  Update Company
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SoldierRoster;