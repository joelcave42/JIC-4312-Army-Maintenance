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
        enum: ["pending","in progress", "awaiting part", "completed", "deleted"],
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
    isClaimed: {
        type: Boolean,
        default: false
    },
    claimedBy: {
        type: String,
        default: null
    },
    comments: {
        type: String,
        required: false
    },
    maintainerComment: {
        type: String,
        default: ''
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: String,
        default: null
    }
});

FaultSchema.index({ createdAt: 1 }); //stores indexes from oldest creation to newest

module.exports = mongoose.model("Fault", FaultSchema);
