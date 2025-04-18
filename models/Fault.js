const mongoose = require("mongoose");

// Required schema for fault objects
const FaultSchema = new mongoose.Schema({
    vehicleType: {                   // <-- NEW field
        type: String,
        required: true
    },
    vehicleId: {
        type: String,
        required: true
    },
    timelines: {
        type: [String],
        required: true
    },
    issues: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "validated", "in progress", "awaiting part", "completed", "deleted"],
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
    lastUpdatedAt: {
        type: Date,
        default: Date.now
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
    },
    completedAt: {
        type: Date,
        default: null
    },
    image: {
        type: Buffer,
        required: false,
    },
    imageMimeType: {
        type: String,
        required: false,
    },
});

FaultSchema.index({ createdAt: 1 }); //stores indexes from oldest creation to newest
//Triggers on any save
FaultSchema.pre("save", function (next) {
    this.lastUpdatedAt = Date.now(); // Update lastUpdatedAt before saving
    next();
});
//Triggers on any query based update
function setLastUpdatedAt(next) {
    this.lastUpdatedAt = Date.now(); // Update lastUpdatedAt before saving
    next();
}
FaultSchema
    .pre("updateOne", setLastUpdatedAt)
    .pre("updateMany", setLastUpdatedAt)
    .pre("findOneAndUpdate", setLastUpdatedAt);

module.exports = mongoose.model("Fault", FaultSchema);
