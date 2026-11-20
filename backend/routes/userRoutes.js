const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admin can view users
router.get("/", protect, authorize("Admin"), getAllUsers);

module.exports = router;