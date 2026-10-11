
const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Login required."
        });
    }

    const token = authHeader.slice(7);

    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) {
            return res.status(403).json({
                success: false,
                message: "Session expired or invalid. Please log in again."
            });
        }

        req.user = {
            id: Number(payload.sub),
            email: payload.email
        };

        next();
    });
}

module.exports = authenticateToken;
