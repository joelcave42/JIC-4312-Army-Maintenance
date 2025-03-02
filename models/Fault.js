const mongoose = require("mongoose");

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
        enum: ["pending", "completed"],
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
        default: Date.now
    }
});

module.exports = mongoose.model("Fault", FaultSchema);
