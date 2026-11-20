const express = require("express");
const router = express.Router();

const {
    createCollector,
    getAllCollectors,
    updateCollector,
    deleteCollector
} = require("../controllers/collectorController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admin can manage collector records
router.post("/", protect, authorize("Admin"), createCollector);
router.get("/", protect, authorize("Admin"), getAllCollectors);
router.put("/:collectorId", protect, authorize("Admin"), updateCollector);
router.delete("/:collectorId", protect, authorize("Admin"), deleteCollector);

module.exports = router;