const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema({
  partName: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0 
  },
  location: { 
    type: String, 
    default: "" 
  },
  minQuantity: { 
    type: Number, 
    default: 5 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Account" 
  }
});

// Add an index on partName for faster lookups
InventoryItemSchema.index({ partName: 1 });

module.exports = mongoose.model("InventoryItem", InventoryItemSchema); 