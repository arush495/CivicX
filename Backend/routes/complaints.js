
const express = require("express");
const { randomBytes } = require("crypto");
const db = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const allowedProblemTypes = [
    "work-delay",
    "work-incomplete",
    "quality-concern",
    "records",
    "other"
];

// Submit a complaint. A valid login token is required.
router.post("/", authenticateToken, (req, res) => {
    try {
        const { projectId, problemType, location, description } = req.body;

        if (
            typeof projectId !== "string" ||
            typeof problemType !== "string" ||
            typeof location !== "string" ||
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required complaint details."
            });
        }

        const cleanProjectId = projectId.trim();
        const cleanLocation = location.trim();
        const cleanDescription = description.trim();

        if (
            !cleanProjectId ||
            cleanProjectId.length > 100 ||
            !allowedProblemTypes.includes(problemType) ||
            !cleanLocation ||
            cleanLocation.length > 200 ||
            !cleanDescription ||
            cleanDescription.length > 1500
        ) {
            return res.status(400).json({
                success: false,
                message: "Some complaint details are invalid."
            });
        }

        const complaintId =
            "CX-" +
            Date.now().toString() +
            "-" +
            randomBytes(3).toString("hex").toUpperCase();

        const result = db.prepare(`
            INSERT INTO complaints (
                complaint_id,
                user_id,
                project_id,
                problem_type,
                location,
                description,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            complaintId,
            req.user.id,
            cleanProjectId,
            problemType,
            cleanLocation,
            cleanDescription,
            "Awaiting Verification"
        );

        return res.status(201).json({
            success: true,
            message: "Complaint submitted successfully.",
            complaint: {
                id: result.lastInsertRowid,
                complaintId,
                projectId: cleanProjectId,
                problemType,
                location: cleanLocation,
                description: cleanDescription,
                status: "Awaiting Verification"
            }
        });
    } catch (error) {
        console.error("Complaint submission failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to submit the complaint right now."
        });
    }
});

// Get complaints belonging to the logged-in user.
router.get("/mine", authenticateToken, (req, res) => {
    try {
        const complaints = db.prepare(`
            SELECT
                complaint_id AS complaintId,
                project_id AS projectId,
                problem_type AS problemType,
                location,
                description,
                status,
                submitted_at AS submittedAt,
                updated_at AS updatedAt
            FROM complaints
            WHERE user_id = ?
            ORDER BY id DESC
        `).all(req.user.id);

        return res.json({
            success: true,
            complaints
        });
    } catch (error) {
        console.error("Loading complaints failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to load your complaints."
        });
    }
});

module.exports = router;
