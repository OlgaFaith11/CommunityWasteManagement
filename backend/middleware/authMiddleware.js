const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized. Please log in."
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token."
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        next();
    };
};

// Residents can only access their own records.
// Admins can access any resident record.
const authorizeResident = (req, res, next) => {
    if (
        req.user.role === "Admin" ||
        (req.user.role === "Resident" &&
         req.user.residentId === req.params.residentId)
    ) {
        return next();
    }

    return res.status(403).json({
        message: "You can only access your own resident records."
    });
};

// Collectors can only access their own schedules.
// Admins can access all schedules.
const authorizeCollector = (req, res, next) => {
    if (
        req.user.role === "Admin" ||
        (req.user.role === "Collector" &&
         req.user.collectorId === req.params.collectorId)
    ) {
        return next();
    }

    return res.status(403).json({
        message: "You can only access your own schedules."
    });
};

module.exports = {
    protect,
    authorize,
    authorizeResident,
    authorizeCollector
};