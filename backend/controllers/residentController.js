const Resident = require("../models/Resident");

// CREATE resident
const createResident = async (req, res) => {
    try {
        const { fullName, phone, email, address, houseNumber } = req.body;

        if (!fullName || !phone || !email || !address || !houseNumber) {
            return res.status(400).json({
                message: "Please provide all resident details."
            });
        }

        const existingResident = await Resident.findOne({ email });

        if (existingResident) {
            return res.status(400).json({
                message: "A resident with this email already exists."
            });
        }

        const count = await Resident.countDocuments();
        const residentId = `R${String(count + 1).padStart(3, "0")}`;

        const resident = await Resident.create({
            residentId,
            fullName,
            phone,
            email,
            address,
            houseNumber
        });

        res.status(201).json({
            message: "Resident registered successfully.",
            resident
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// READ all residents
const getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.find().sort({ createdAt: -1 });
        res.status(200).json(residents);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// READ one resident
const getResident = async (req, res) => {
    try {
        const resident = await Resident.findOne({
            residentId: req.params.residentId
        });

        if (!resident) {
            return res.status(404).json({
                message: "Resident not found."
            });
        }

        res.status(200).json(resident);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// UPDATE resident
const updateResident = async (req, res) => {
    try {
        const resident = await Resident.findOneAndUpdate(
            { residentId: req.params.residentId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!resident) {
            return res.status(404).json({
                message: "Resident not found."
            });
        }

        res.status(200).json({
            message: "Resident updated successfully.",
            resident
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// DELETE resident
const deleteResident = async (req, res) => {
    try {
        const resident = await Resident.findOneAndDelete({
            residentId: req.params.residentId
        });

        if (!resident) {
            return res.status(404).json({
                message: "Resident not found."
            });
        }

        res.status(200).json({
            message: "Resident deleted successfully."
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createResident,
    getAllResidents,
    getResident,
    updateResident,
    deleteResident
};