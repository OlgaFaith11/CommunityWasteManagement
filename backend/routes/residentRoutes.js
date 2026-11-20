const express = require("express");
const router = express.Router();

const {
    createResident,
    getAllResidents,
    getResident,
    updateResident,
    deleteResident
} = require("../controllers/residentController");

const {
    protect,
    authorize,
    authorizeResident
} = require("../middleware/authMiddleware");

// Admin creates resident records
router.post("/", protect, authorize("Admin"), createResident);

// Admin views all residents
router.get("/", protect, authorize("Admin"), getAllResidents);

// Admin or the respective resident views a resident record
router.get(
    "/:residentId",
    protect,
    authorize("Admin", "Resident"),
    authorizeResident,
    getResident
);

// Admin updates resident records
router.put(
    "/:residentId",
    protect,
    authorize("Admin"),
    updateResident
);

// Admin deletes resident records
router.delete(
    "/:residentId",
    protect,
    authorize("Admin"),
    deleteResident
);

module.exports = router;