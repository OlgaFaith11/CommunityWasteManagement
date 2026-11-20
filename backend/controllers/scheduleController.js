const Schedule = require("../models/Schedules");

// CREATE SCHEDULE
exports.createSchedule = async (req, res) => {
    try {
        const count = await Schedule.countDocuments();
        const scheduleId = `S${String(count + 1).padStart(3, "0")}`;

        const schedule = await Schedule.create({
            ...req.body,
            scheduleId
        });

        res.status(201).json({
            message: "Schedule created successfully.",
            schedule
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ALL SCHEDULES
exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ createdAt: -1 });
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET SCHEDULES FOR A COLLECTOR
exports.getCollectorSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find({
            collectorId: req.params.collectorId
        });

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE SCHEDULE
exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findOneAndUpdate(
            { scheduleId: req.params.scheduleId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found."
            });
        }

        res.status(200).json({
            message: "Schedule updated successfully.",
            schedule
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE SCHEDULE
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findOneAndDelete({
            scheduleId: req.params.scheduleId
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found."
            });
        }

        res.status(200).json({
            message: "Schedule deleted successfully."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};