const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/Users");

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "faitholga11@gmail.com";
        const password = "12345678";

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await User.findOneAndUpdate(
            { userId: "ADMIN001" },
            {
                email,
                passwordHash,
                status: "Active"
            },
            { new: true, runValidators: true }
        );

        if (admin) {
            console.log("Admin account updated successfully!");
        } else {
            console.log("Admin account not found.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

updateAdmin();