const WasteRequest = require("../models/WasteRequests");
const Collector = require("../models/Collectors");

// Generate request ID
const generateRequestId = async () => {
    const requests = await WasteRequest.find().select("requestId");

    let highestNumber = 0;

    requests.forEach(request => {
        const number = parseInt(request.requestId.replace("WR", ""), 10);

        if (!isNaN(number) && number > highestNumber) {
            highestNumber = number;
        }
    });

    return `WR${String(highestNumber + 1).padStart(3, "0")}`;
};

// CREATE REQUEST (RESIDENT)
exports.createRequest = async (req, res) => {
    try {
        const { wasteType, quantity, description, pickupAddress } = req.body;
        const residentId = req.user.residentId;

        if (!residentId) {
            return res.status(400).json({
                message: "Resident account could not be identified."
            });
        }

        if (!wasteType || !description || !pickupAddress) {
            return res.status(400).json({
                message: "Please provide all required details."
            });
        }

        const requestId = await generateRequestId();

        const newRequest = await WasteRequest.create({
            requestId,
            residentId,
            wasteType,
            quantity,
            description,
            pickupAddress,
            status: "Pending"
        });

        res.status(201).json({
            message: "Waste collection request submitted successfully.",
            request: newRequest
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL REQUESTS (ADMIN)
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await WasteRequest.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET RESIDENT REQUESTS
exports.getResidentRequests = async (req, res) => {
    try {
        const requests = await WasteRequest.find({
            residentId: req.params.residentId
        }).sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN ASSIGNS REQUEST TO COLLECTOR
exports.assignRequest = async (req, res) => {
    try {
        const { collectorId } = req.body;

        if (!collectorId) {
            return res.status(400).json({
                message: "Please select a collector."
            });
        }

        const collector = await Collector.findOne({
            collectorId,
            status: "Active"
        });

        if (!collector) {
            return res.status(404).json({
                message: "Active collector not found."
            });
        }

        const request = await WasteRequest.findOne({
            requestId: req.params.requestId
        });

        if (!request) {
            return res.status(404).json({
                message: "Waste request not found."
            });
        }

        if (request.status === "Collected" || request.status === "Rejected") {
            return res.status(400).json({
                message: "This request cannot be assigned."
            });
        }

        request.collectorId = collectorId;
        request.status = "Assigned";

        await request.save();

        res.status(200).json({
            message: "Request assigned successfully.",
            request
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET REQUESTS ASSIGNED TO LOGGED-IN COLLECTOR
exports.getCollectorRequests = async (req, res) => {
    try {
        const collectorId = req.user.collectorId;

        if (!collectorId) {
            return res.status(400).json({
                message: "Collector account could not be identified."
            });
        }

        const requests = await WasteRequest.find({
            collectorId
        }).sort({ createdAt: -1 });

        res.status(200).json(requests);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// COLLECTOR MARKS REQUEST AS COLLECTED
exports.markRequestCollected = async (req, res) => {
    try {
        const collectorId = req.user.collectorId;

        const request = await WasteRequest.findOne({
            requestId: req.params.requestId,
            collectorId
        });

        if (!request) {
            return res.status(404).json({
                message: "Assigned request not found."
            });
        }

        if (request.status !== "Assigned") {
            return res.status(400).json({
                message: "Only assigned requests can be marked as collected."
            });
        }

        request.status = "Collected";
        request.collectionDate = new Date();

        await request.save();

        res.status(200).json({
            message: "Waste collection completed successfully.",
            request
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE REQUEST (ADMIN)
exports.updateRequest = async (req, res) => {
    try {
        const allowedFields = ["status"];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const request = await WasteRequest.findOneAndUpdate(
            { requestId: req.params.requestId },
            updates,
            { new: true, runValidators: true }
        );

        if (!request) {
            return res.status(404).json({
                message: "Waste request not found."
            });
        }

        res.status(200).json({
            message: "Waste request updated successfully.",
            request
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE REQUEST (ADMIN)
exports.deleteRequest = async (req, res) => {
    try {
        const request = await WasteRequest.findOneAndDelete({
            requestId: req.params.requestId
        });

        if (!request) {
            return res.status(404).json({
                message: "Waste request not found."
            });
        }

        res.status(200).json({
            message: "Waste request deleted successfully."
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};