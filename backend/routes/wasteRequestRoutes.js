const express = require("express");
const router = express.Router();

const {
    createRequest,
    getAllRequests,
    getResidentRequests,
    assignRequest,
    getCollectorRequests,
    markRequestCollected,
    updateRequest,
    deleteRequest
} = require("../controllers/wasteRequestController");

const {
    protect,
    authorize,
    authorizeResident
} = require("../middleware/authMiddleware");

// Resident submits request
router.post("/", protect, authorize("Resident"), createRequest);

// Admin views all requests
router.get("/", protect, authorize("Admin"), getAllRequests);

// Collector views their assigned requests
router.get(
    "/collector",
    protect,
    authorize("Collector"),
    getCollectorRequests
);

// Collector marks assigned request as collected
router.put(
    "/:requestId/collect",
    protect,
    authorize("Collector"),
    markRequestCollected
);

// Resident views own requests
router.get(
    "/resident/:residentId",
    protect,
    authorize("Admin", "Resident"),
    authorizeResident,
    getResidentRequests
);

// Admin assigns request
router.put(
    "/:requestId/assign",
    protect,
    authorize("Admin"),
    assignRequest
);

// Admin updates request
router.put("/:requestId", protect, authorize("Admin"), updateRequest);

// Admin deletes request
router.delete("/:requestId", protect, authorize("Admin"), deleteRequest);

module.exports = router;