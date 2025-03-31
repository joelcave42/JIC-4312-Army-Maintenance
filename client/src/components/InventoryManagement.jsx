import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/InventoryManagement.css";

const inventoryUrl = "http://localhost:3000/api/v1/inventory";

const InventoryManagement = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    partName: "",
    description: "",
    quantity: 0,
    location: "",
    minQuantity: 5
  });

  // Edit item form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Adjust quantity form state
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustment, setAdjustment] = useState(0);

  // Get user ID from localStorage
  const userID = localStorage.getItem("userID");

  // Fetch all inventory items
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(inventoryUrl);
      setInventoryItems(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle form input changes for adding new item
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === "quantity" || name === "minQuantity" ? parseInt(value) || 0 : value
    });
  };

  // Add a new inventory item
  const addInventoryItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(inventoryUrl, {
        ...newItem,
        userID
      });
      toast.success("Item added successfully");
      setNewItem({
        partName: "",
        description: "",
        quantity: 0,
        location: "",
        minQuantity: 5
      });
      setShowAddForm(false);
      fetchInventory();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(error.response?.data?.message || "Failed to add item");
    }
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  // Handle form input changes for editing item
  const handleEditItemChange = (e) => {
    const { name, value } = e.target;
    setEditingItem({
      ...editingItem,
      [name]: name === "quantity" || name === "minQuantity" ? parseInt(value) || 0 : value
    });
  };

  // Update an inventory item
  const updateInventoryItem = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${inventoryUrl}/${editingItem._id}`, {
        ...editingItem,
        userID
      });
      toast.success("Item updated successfully");
      setShowEditForm(false);
      setEditingItem(null);
      fetchInventory();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(error.response?.data?.message || "Failed to update item");
    }
  };

  // Delete an inventory item
  const deleteInventoryItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${inventoryUrl}/${id}`);
        toast.success("Item deleted successfully");
        fetchInventory();
      } catch (error) {
        console.error("Error deleting item:", error);
        toast.error(error.response?.data?.message || "Failed to delete item");
      }
    }
  };

  // Handle adjust quantity
  const handleAdjustQuantity = (item) => {
    setAdjustingItem(item);
    setAdjustment(0);
    setShowAdjustForm(true);
  };

  // Submit quantity adjustment
  const submitAdjustment = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${inventoryUrl}/${adjustingItem._id}/adjust`, {
        adjustment,
        userID
      });
      toast.success("Quantity adjusted successfully");
      setShowAdjustForm(false);
      setAdjustingItem(null);
      setAdjustment(0);
      fetchInventory();
    } catch (error) {
      console.error("Error adjusting quantity:", error);
      toast.error(error.response?.data?.message || "Failed to adjust quantity");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="inventory-container">
      <button className="back-button" onClick={() => navigate("/home")}>
        Back
      </button>
      
      <h2 className="inventory-title">Inventory Management</h2>
      
      <div className="inventory-actions">
        <button 
          className="add-item-button" 
          onClick={() => setShowAddForm(true)}
        >
          Add New Item
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading inventory...</p>
      ) : (
        <div className="inventory-grid">
          {inventoryItems.length === 0 ? (
            <p className="no-items">No inventory items found. Add items to get started.</p>
          ) : (
            inventoryItems.map((item) => (
              <div key={item._id} className="inventory-item">
                <div className="item-header">
                  <h3 className="item-name">{item.partName}</h3>
                  <span className={`status-badge ${item.quantity <= item.minQuantity ? 'low' : 'ok'}`}>
                    {item.quantity <= item.minQuantity ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <div className="item-details">
                  <div className="detail-row">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{item.quantity}</span>
                  </div>
                  
                  {item.description && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{item.description}</span>
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{item.location}</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">Min Quantity:</span>
                    <span className="detail-value">{item.minQuantity}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">{formatDate(item.lastUpdated)}</span>
                  </div>
                </div>

                <div className="item-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="adjust-button"
                    onClick={() => handleAdjustQuantity(item)}
                  >
                    Adjust Quantity
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => deleteInventoryItem(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Item Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Inventory Item</h3>
            <form onSubmit={addInventoryItem}>
              <div className="form-group">
                <label htmlFor="partName">Part Name:</label>
                <input
                  type="text"
                  id="partName"
                  name="partName"
                  value={newItem.partName}
                  onChange={handleNewItemChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleNewItemChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Storage Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newItem.location}
                  onChange={handleNewItemChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="minQuantity">Minimum Quantity:</label>
                <input
                  type="number"
                  id="minQuantity"
                  name="minQuantity"
                  min="0"
                  value={newItem.minQuantity}
                  onChange={handleNewItemChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit">Add Item</button>
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Form Modal */}
      {showEditForm && editingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Inventory Item</h3>
            <form onSubmit={updateInventoryItem}>
              <div className="form-group">
                <label htmlFor="editPartName">Part Name:</label>
                <input
                  type="text"
                  id="editPartName"
                  name="partName"
                  value={editingItem.partName}
                  onChange={handleEditItemChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editDescription">Description:</label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={editingItem.description}
                  onChange={handleEditItemChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editQuantity">Quantity:</label>
                <input
                  type="number"
                  id="editQuantity"
                  name="quantity"
                  min="0"
                  value={editingItem.quantity}
                  onChange={handleEditItemChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editLocation">Storage Location:</label>
                <input
                  type="text"
                  id="editLocation"
                  name="location"
                  value={editingItem.location}
                  onChange={handleEditItemChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editMinQuantity">Minimum Quantity:</label>
                <input
                  type="number"
                  id="editMinQuantity"
                  name="minQuantity"
                  min="0"
                  value={editingItem.minQuantity}
                  onChange={handleEditItemChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit">Update Item</button>
                <button type="button" onClick={() => setShowEditForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Quantity Form Modal */}
      {showAdjustForm && adjustingItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adjust Quantity</h3>
            <p>Current quantity: {adjustingItem.quantity}</p>
            <form onSubmit={submitAdjustment}>
              <div className="form-group">
                <input
                  type="number"
                  id="adjustment"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit">Confirm</button>
                <button type="button" onClick={() => setShowAdjustForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement; 