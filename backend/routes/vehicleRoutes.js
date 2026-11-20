const express = require("express");
const router = express.Router();

const {
    createVehicle,
    getAllVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admin can manage vehicles
router.post("/", protect, authorize("Admin"), createVehicle);
router.get("/", protect, authorize("Admin"), getAllVehicles);
router.get("/:vehicleId", protect, authorize("Admin"), getVehicle);
router.put("/:vehicleId", protect, authorize("Admin"), updateVehicle);
router.delete("/:vehicleId", protect, authorize("Admin"), deleteVehicle);

module.exports = router;