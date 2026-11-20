const Collector = require("../models/Collectors");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");

// ADD COLLECTOR AND CREATE LOGIN ACCOUNT
exports.createCollector = async (req, res) => {
    let createdCollector = null;

    try {
        const { fullName, phone, email, status, password } = req.body;

        if (!fullName || !phone || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required details."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingCollector = await Collector.findOne({
            email: normalizedEmail
        });

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingCollector || existingUser) {
            return res.status(400).json({
                message: "This email address is already registered."
            });
        }

        // Generate the next available collector ID
        const allCollectors = await Collector.find()
            .select("collectorId");

        let highestNumber = 0;

        allCollectors.forEach(collector => {
            const number = parseInt(
                collector.collectorId.replace("C", ""),
                10
            );

            if (!isNaN(number) && number > highestNumber) {
                highestNumber = number;
            }
        });

        const collectorId =
            `C${String(highestNumber + 1).padStart(3, "0")}`;

        // Create collector profile
        createdCollector = await Collector.create({
            collectorId,
            fullName,
            phone,
            email: normalizedEmail,
            status: status || "Active"
        });

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create login account
        const user = await User.create({
            userId: `USER-${collectorId}`,
            email: normalizedEmail,
            passwordHash,
            role: "Collector",
            status: status || "Active",
            collectorId
        });

        res.status(201).json({
            message: "Collector and login account created successfully.",
            collector: createdCollector,
            account: {
                userId: user.userId,
                email: user.email,
                role: user.role,
                collectorId: user.collectorId
            }
        });

    } catch (error) {

        // Remove collector profile if account creation fails
        if (createdCollector) {
            await Collector.deleteOne({
                _id: createdCollector._id
            });
        }

        console.error("Collector creation error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};

// GET ALL COLLECTORS
exports.getAllCollectors = async (req, res) => {
    try {
        const collectors = await Collector.find().sort({ createdAt: -1 });
        res.status(200).json(collectors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE COLLECTOR
exports.updateCollector = async (req, res) => {
    try {
        const collector = await Collector.findOneAndUpdate(
            { collectorId: req.params.collectorId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!collector) {
            return res.status(404).json({
                message: "Collector not found."
            });
        }

        res.status(200).json({
            message: "Collector updated successfully.",
            collector
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE COLLECTOR
exports.deleteCollector = async (req, res) => {
    try {
        const collector = await Collector.findOneAndDelete({
            collectorId: req.params.collectorId
        });

        if (!collector) {
            return res.status(404).json({
                message: "Collector not found."
            });
        }

        await User.findOneAndUpdate(
            { collectorId: req.params.collectorId },
            { status: "Inactive" }
        );

        res.status(200).json({
            message: "Collector deleted and login account deactivated."
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};