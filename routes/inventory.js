// routes/inventory.js
const express = require("express");
const router = express.Router();

const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  adjustQuantity
} = require("../controllers/inventory");

// GET /api/v1/inventory - Get all inventory items
router.get("/", getAllItems);

// POST /api/v1/inventory - Create a new inventory item
router.post("/", createItem);

// PUT /api/v1/inventory/:id - Update an inventory item
router.put("/:id", updateItem);

// DELETE /api/v1/inventory/:id - Delete an inventory item
router.delete("/:id", deleteItem);

// PATCH /api/v1/inventory/:id/adjust - Adjust quantity of an inventory item
router.patch("/:id/adjust", adjustQuantity);

module.exports = router; 