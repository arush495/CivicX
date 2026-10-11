
const express = require("express");
const db = require("../db");
const authenticateToken = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// Get complaints for the admin review panel.
router.get("/complaints", (req, res) => {
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
            ORDER BY id DESC
        `).all();

        res.json({ success: true, complaints });
    } catch (error) {
        console.error("Admin complaint list error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not load complaints."
        });
    }
});

// Update a complaint only through the permitted review workflow.
router.patch("/complaints/:complaintId/status", (req, res) => {
    const { status } = req.body;
    const complaintId = req.params.complaintId;

    const allowedStatuses = [
        "Verified - Ready for Action",
        "Not Verified",
        "Referred to Authority"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid complaint status."
        });
    }

    try {
        const complaint = db.prepare(`
            SELECT status
            FROM complaints
            WHERE complaint_id = ?
        `).get(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: "Complaint not found."
            });
        }

        const currentStatus =
            complaint.status || "Awaiting Verification";

        let permitted = false;

        if (currentStatus === "Awaiting Verification") {
            permitted =
                status === "Verified - Ready for Action" ||
                status === "Not Verified";
        } else if (currentStatus === "Verified - Ready for Action") {
            permitted = status === "Referred to Authority";
        }

        if (!permitted) {
            return res.status(409).json({
                success: false,
                message: "This status change is not permitted."
            });
        }

        db.prepare(`
            UPDATE complaints
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE complaint_id = ?
        `).run(status, complaintId);

        res.json({
            success: true,
            message: "Complaint status updated.",
            complaintId,
            status
        });
    } catch (error) {
        console.error("Admin status update error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not update complaint status."
        });
    }
});

module.exports = router;
