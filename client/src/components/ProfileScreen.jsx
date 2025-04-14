import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileScreen.css";
import { toast } from "react-toastify";

const ProfileScreen = () => {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [company, setCompany] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const storedUserId = localStorage.getItem("userID");
      if (!storedUserId) {
        toast.error("User ID not found in local storage.");
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/v1/accounts/account-info?userId=${storedUserId}`
      );

      if (response.data.success) {
        const userData = response.data.data;
        setUsername(userData.username);
        setUserType(userData.accountType);
        setCompany(userData.company);
        setNewCompany(userData.company);
        localStorage.setItem("company", userData.company);
      } else {
        toast.error("Failed to load user info.");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast.error("Error loading profile: " + error.message);
    }
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userID"); // ✅ use localStorage directly
      const requesterId = userId;

      const response = await axios.patch("http://localhost:3000/api/v1/accounts/company", {
        requesterId,
        userId,
        newCompany,
      });

      if (response.data.success) {
        setCompany(newCompany);
        toast.success("Company updated successfully!");
      }
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error(error.response?.data?.message || "Error updating company");
    }
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="home-screen">
      <h1 className="home-title">Profile</h1>

      <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Account Type:</strong> {userType}</p>
        <p><strong>Current Company:</strong> {company}</p>

        <form onSubmit={handleCompanyUpdate} style={{ marginTop: "20px" }}>
          <label htmlFor="newCompany"><strong>Update Company:</strong></label>
          <input
            id="newCompany"
            type="text"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="Enter new company name"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            className="home-button"
            style={{ width: "100%" }}
          >
            Update Company
          </button>
        </form>

        <button
          onClick={handleGoHome}
          className="home-button"
          style={{ width: "100%", marginTop: "20px" }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;
