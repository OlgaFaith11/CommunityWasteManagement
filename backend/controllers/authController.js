const User = require("../models/Users");
const Resident = require("../models/Resident");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// RESIDENT REGISTRATION
exports.registerResident = async (req, res) => {
    try {
        const { fullName, phone, email, address, houseNumber, password } = req.body;

        if (!fullName || !phone || !email || !address || !houseNumber || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email already registered." });
        }

        const residentCount = await Resident.countDocuments();
        const userCount = await User.countDocuments();

        const residentId = `R${String(residentCount + 1).padStart(3, "0")}`;
        const userId = `U${String(userCount + 1).padStart(3, "0")}`;

        const newResident = await Resident.create({
            residentId,
            fullName,
            phone,
            email,
            address,
            houseNumber,
            createdAt: new Date()
        });

        const passwordHash = await bcrypt.hash(password, 10);

        await User.create({
            userId,
            email,
            passwordHash,
            role: "Resident",
            residentId
        });

        res.status(201).json({
            message: "Registration successful!",
            residentId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// USER LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign(
    {
        userId: user.userId,
        role: user.role,
        residentId: user.residentId,
        collectorId: user.collectorId
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
);

        res.status(200).json({
            message: "Login successful!",
            token,
            role: user.role,
            userId: user.userId
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};