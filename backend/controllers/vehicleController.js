const Vehicle = require("../models/Vehicles");

// ADD VEHICLE
exports.createVehicle = async (req, res) => {
    try {
        const { registrationNumber, vehicleType, capacityKg, status } = req.body;

        const existingVehicle = await Vehicle.findOne({ registrationNumber });

        if (existingVehicle) {
            return res.status(400).json({
                message: "Vehicle registration number already exists."
            });
        }

        const count = await Vehicle.countDocuments();
        const vehicleId = `V${String(count + 1).padStart(3, "0")}`;

        const vehicle = await Vehicle.create({
            vehicleId,
            registrationNumber,
            vehicleType,
            capacityKg,
            status
        });

        res.status(201).json({
            message: "Vehicle added successfully.",
            vehicle
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL VEHICLES
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ createdAt: -1 });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ONE VEHICLE
exports.getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            vehicleId: req.params.vehicleId
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found." });
        }

        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE VEHICLE
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { vehicleId: req.params.vehicleId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found." });
        }

        res.status(200).json({
            message: "Vehicle updated successfully.",
            vehicle
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE VEHICLE
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({
            vehicleId: req.params.vehicleId
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found." });
        }

        res.status(200).json({
            message: "Vehicle deleted successfully."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};