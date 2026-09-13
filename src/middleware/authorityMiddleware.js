const authorityMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "authority") {
        return res.status(403).json({
            message: "Authority access required"
        });
    }

    next();
};

module.exports = authorityMiddleware;
