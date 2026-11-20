const mongoose = require("mongoose");

const wasteRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },

    residentId: {
        type: String,
        required: true
    },

    collectorId: {
        type: String,
        default: null
    },

    wasteType: {
        type: String,
        enum: ["Household", "Commercial", "Recyclable", "Hazardous"],
        required: true
    },

    quantity: {
        type: Number
    },

    description: {
        type: String,
        required: true
    },

    pickupAddress: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Assigned", "Collected", "Rejected"],
        default: "Pending"
    },

    collectionDate: {
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    collection: "wasteRequests"
});

module.exports = mongoose.model("WasteRequest", wasteRequestSchema);