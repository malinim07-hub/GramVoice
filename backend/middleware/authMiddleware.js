const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // Authorization header get pannuvom
        const authHeader = req.headers.authorization;

        // Token irukka nu check
        if (!authHeader) {
            return res.status(401).json({
                message: "Access Denied. No Token Provided"
            });
        }

        // "Bearer TOKEN" la irundhu TOKEN mattum eduppom
        const token = authHeader.split(" ")[1];

        // Token verify pannuvom
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User information request-la save pannuvom
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token"
        });
    }
};

module.exports = authMiddleware;