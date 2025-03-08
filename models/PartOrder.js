// models/PartOrder.js
const mongoose = require("mongoose");

const PartOrderSchema = new mongoose.Schema({
  partName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["ORDERED", "ARRIVED"],
    default: "ORDERED",
  },
  // We reference the 'Account' model's _id
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  fault: { type: mongoose.Schema.Types.ObjectId, ref: "Fault" }, //Reference a fault
  orderedAt: { type: Date, default: Date.now },
  arrivedAt: { type: Date },
});

module.exports = mongoose.model("PartOrder", PartOrderSchema);
