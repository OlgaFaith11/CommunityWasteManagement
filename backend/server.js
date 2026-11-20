const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
const path = require("path");

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
    res.status(200).send("Community Waste Management API is running!");
});


// AUTHENTICATION
app.use("/api/auth", require("./routes/authRoutes"));

// RESIDENTS
app.use("/api/residents", require("./routes/residentRoutes"));

// COLLECTORS
app.use("/api/collectors", require("./routes/collectorRoutes"));

// VEHICLES
app.use("/api/vehicles", require("./routes/vehicleRoutes"));

// WASTE REQUESTS
app.use("/api/waste-requests", require("./routes/wasteRequestRoutes"));

// SCHEDULES
app.use("/api/schedules", require("./routes/scheduleRoutes"));

app.use("/api/users", require("./routes/userRoutes"));

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        message: "An internal server error occurred.",
        error: err.message
    });
});

// START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();