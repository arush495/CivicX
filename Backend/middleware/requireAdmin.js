
const db = require("../db");

function requireAdmin(req, res, next) {
    // authenticateToken must run before this middleware.
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    try {
        const user = db.prepare(`
            SELECT role
            FROM users
            WHERE id = ?
        `).get(req.user.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found."
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access is required."
            });
        }

        next();

    } catch (error) {
        console.error("Admin authorization failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to verify permissions."
        });
    }
}

module.exports = requireAdmin;
