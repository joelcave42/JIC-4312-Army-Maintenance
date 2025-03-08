// controllers/parts.js
const PartOrder = require("../models/PartOrder");
const Fault = require("../models/Fault");

/**
 * Create a new part order (e.g., Clerk or authorized user).
 * Expects { partName, quantity, userID, fault } in req.body.
 */
const createPartOrder = async (req, res) => {
  try {
    const { partName, quantity, userID, fault } = req.body;

    // Basic validation
    if (!partName || !quantity || !userID || !fault) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: partName, quantity, userID, fault",
      });
    }

    // Create a new PartOrder document
    const newOrder = new PartOrder({
      partName,
      quantity,
      orderedBy: userID, // references an Account _id
      fault,             // references a Fault _id
    });

    await newOrder.save();
    return res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get part orders with optional filters:
 *  - ?status=ORDERED or ARRIVED
 *  - ?fault=<faultId> to get parts for a specific fault
 */
const getPartOrders = async (req, res) => {
  try {
    const { status, fault } = req.query;
    const filter = {};

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }
    // Filter by fault if provided
    if (fault) {
      filter.fault = fault;
    }

    // Populate "orderedBy" to show the user's username (or any fields you need)
    const orders = await PartOrder.find(filter)
      .populate("orderedBy", "username")
      .populate("fault"); // optional, if you want to see fault data

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark a part as arrived (Clerk action or authorized user).
 * Endpoint: PATCH /api/v1/parts/:id/arrive
 */
const markAsArrived = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PartOrder.findById(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.status === "ARRIVED") {
      return res
        .status(400)
        .json({ success: false, message: "Order already marked as arrived" });
    }

    order.status = "ARRIVED";
    order.arrivedAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Part marked as arrived",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all ARRIVED parts belonging to the operator’s faults.
 * No time-based filtering here—returns *all* arrived parts.
 * Endpoint: GET /api/v1/parts/arrived-operator/:operatorUsername
 */
const getArrivedPartsForOperator = async (req, res) => {
    try {
      console.log("Debug: In getArrivedPartsForOperator");
      const operatorUsername = req.params.username; // must match :username in routes
      console.log("Debug: operatorUsername =", operatorUsername);
  
      // No more time filter. We'll see all arrived parts.
      const faults = await Fault.find({ createdBy: operatorUsername }, { _id: 1 });
      console.log("Debug: Found fault IDs:", faults); // Show the array
  
      const faultIds = faults.map((f) => f._id);
      if (faultIds.length === 0) {
        console.log("Debug: No faults for this user => returning empty");
        return res.json({ success: true, data: [] });
      }
  
      // Show the filter
      const filter = {
        fault: { $in: faultIds },
        status: "ARRIVED",
      };
      console.log("Debug: filter =", filter);
  
      const arrivedParts = await PartOrder.find(filter).populate("fault");
      console.log("Debug: found arrivedParts =>", arrivedParts);
  
      return res.json({ success: true, data: arrivedParts });
    } catch (error) {
      console.error("Error in getArrivedPartsForOperator:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  

module.exports = {
  createPartOrder,
  getPartOrders,
  markAsArrived,
  getArrivedPartsForOperator,
};
