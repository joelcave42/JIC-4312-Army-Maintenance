// routes/parts.js
const express = require("express");
const router = express.Router();

const {
  createPartOrder,
  getPartOrders,
  markAsArrived,
  getArrivedPartsForOperator,
} = require("../controllers/parts");

// POST /api/v1/parts => Create a new part order
router.post("/", createPartOrder);

// GET /api/v1/parts => Retrieve part orders (optionally filter by status/fault)
router.get("/", getPartOrders);

// PATCH /api/v1/parts/:id/arrive => Mark part as arrived
router.patch("/:id/arrive", markAsArrived);

// GET /api/v1/parts/arrived-operator/:username => Get arrived parts for that operator's faults
router.get("/arrived-operator/:username", getArrivedPartsForOperator);

module.exports = router;
