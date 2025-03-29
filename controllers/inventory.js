const InventoryItem = require("../models/InventoryItem");

/**
 * Get all inventory items
 */
const getAllItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ partName: 1 });
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new inventory item
 */
const createItem = async (req, res) => {
  try {
    const { partName, description, quantity, location, minQuantity, userID } = req.body;

    // Basic validation
    if (!partName || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: partName, quantity",
      });
    }

    // Check if item already exists
    const existingItem = await InventoryItem.findOne({ partName });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "An item with this part name already exists",
      });
    }

    // Create a new inventory item
    const newItem = new InventoryItem({
      partName,
      description: description || "",
      quantity,
      location: location || "",
      minQuantity: minQuantity || 5,
      updatedBy: userID
    });

    await newItem.save();
    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an inventory item
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { partName, description, quantity, location, minQuantity, userID } = req.body;

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Update fields if provided
    if (partName) item.partName = partName;
    if (description !== undefined) item.description = description;
    if (quantity !== undefined) item.quantity = quantity;
    if (location !== undefined) item.location = location;
    if (minQuantity !== undefined) item.minQuantity = minQuantity;
    
    item.lastUpdated = Date.now();
    item.updatedBy = userID;

    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an inventory item
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    
    return res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Adjust quantity of an inventory item (increment or decrement)
 */
const adjustQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustment, userID } = req.body;
    
    if (adjustment === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: adjustment",
      });
    }

    const item = await InventoryItem.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }
    
    // Ensure quantity doesn't go below 0
    const newQuantity = item.quantity + adjustment;
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot reduce quantity below 0",
      });
    }
    
    item.quantity = newQuantity;
    item.lastUpdated = Date.now();
    item.updatedBy = userID;
    
    await item.save();
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  adjustQuantity
}; 