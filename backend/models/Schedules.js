const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    scheduleId: {
        type: String,
        required: true,
        unique: true
    },
    requestId: {
        type: String
    },
    collectorId: {
        type: String,
        required: true
    },
    vehicleId: {
        type: String,
        required: true
    },
    collectionDate: {
        type: Date,
        required: true
    },
    area: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
        default: "Scheduled"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: "schedules" });

module.exports = mongoose.model("Schedule", scheduleSchema);