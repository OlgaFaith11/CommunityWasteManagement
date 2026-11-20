const express = require("express");
const router = express.Router();

const {
    registerResident,
    login
} = require("../controllers/authController");

// Resident registration
router.post("/register", registerResident);

// Login for all users
router.post("/login", login);

module.exports = router;