const mongoose = require("mongoose");

// Required schema for fault objects
const FaultSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true
    },
    issues: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        enum: ["pending","claimed", "completed"],
        default: "pending",
    },
    customIssue: {
        type: String,
        required: false
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    claimedBy: {
        type: String,
        default: null
    }
});

FaultSchema.index({ createdAt: 1 }); //stores indexes from oldest creation to newest

module.exports = mongoose.model("Fault", FaultSchema);
