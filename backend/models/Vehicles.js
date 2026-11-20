const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
        unique: true
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    capacityKg: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: "vehicles"
});

module.exports = mongoose.model("Vehicle", vehicleSchema);