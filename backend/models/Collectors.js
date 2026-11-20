const mongoose = require("mongoose");

const collectorSchema = new mongoose.Schema({
    collectorId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
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
    collection: "collectors"
});

module.exports = mongoose.model("Collector", collectorSchema);