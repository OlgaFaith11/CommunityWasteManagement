const express = require("express");
const router = express.Router();

const {
    createSchedule,
    getAllSchedules,
    getCollectorSchedules,
    updateSchedule,
    deleteSchedule
} = require("../controllers/scheduleController");

const {
    protect,
    authorize,
    authorizeCollector
} = require("../middleware/authMiddleware");

// Admin creates a collection schedule
router.post("/", protect, authorize("Admin"), createSchedule);

// Admin views all schedules
router.get("/", protect, authorize("Admin"), getAllSchedules);

// Admin or the assigned collector views schedules
router.get(
    "/collector/:collectorId",
    protect,
    authorize("Admin", "Collector"),
    authorizeCollector,
    getCollectorSchedules
);

// Admin updates a schedule
router.put("/:scheduleId", protect, authorize("Admin"), updateSchedule);

// Admin deletes a schedule
router.delete("/:scheduleId", protect, authorize("Admin"), deleteSchedule);

module.exports = router;