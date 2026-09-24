const jwt = require("jsonwebtoken");
const Authority = require("../models/Authority");

const authorityMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check that this token belongs to an authority
        if (decoded.role !== "authority") {
            return res.status(403).json({
                message: "Access denied. Authority only."
            });
        }

        // Find authority in database
        const authority = await Authority.findById(decoded.id);

        if (!authority) {
            return res.status(403).json({
                message: "Authority not found"
            });
        }

        // Store authority in request
        req.user = authority;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authorityMiddleware;
