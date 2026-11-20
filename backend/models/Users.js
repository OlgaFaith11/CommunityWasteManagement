const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["Admin", "Resident", "Collector"],
        required: true
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    residentId: String,
    collectorId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: "users" });

module.exports = mongoose.model("User", userSchema);