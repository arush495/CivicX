
/* CIVICX - Admin Panel connected to Backend */

const API_URL = "/api";

const complaintList = document.getElementById("adminComplaintList");

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
}

function createButton(text, className, onClick) {
    const button = createElement("button", "btn " + className, text);
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
}

function getToken() {
    return sessionStorage.getItem("civicxToken");
}

function showMessage(message, type = "") {
    complaintList.replaceChildren();
    complaintList.appendChild(
        createElement("p", type, message)
    );
}

async function loadComplaints() {
    const token = getToken();

    if (!token) {
        showMessage("Please log in with an authorised admin account.");
        return;
    }

    showMessage("Loading complaints...");

    try {
        const response = await fetch(`${API_URL}/admin/complaints`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(
                    "Admin access denied. Use an account with the admin role."
                );
            }

            if (response.status === 401) {
                throw new Error("Session expired. Please log in again.");
            }

            throw new Error(data.message || "Could not load complaints.");
        }

        renderComplaints(data.complaints || []);

    } catch (error) {
        showMessage(
            error.message === "Failed to fetch"
                ? "Cannot connect to the backend. Check that localhost:3000 is running."
                : error.message,
            "track-error"
        );
    }
}

function renderComplaints(complaints) {
    complaintList.replaceChildren();

    const pending = complaints.filter(
        item => item.status === "Awaiting Verification"
    ).length;

    const verified = complaints.filter(
        item =>
            item.status === "Verified - Ready for Action" ||
            item.status === "Referred to Authority"
    ).length;

    document.getElementById("totalReports").textContent =
        complaints.length;

    document.getElementById("pendingReports").textContent = pending;
    document.getElementById("verifiedReports").textContent = verified;

    if (complaints.length === 0) {
        showMessage("No complaints have been submitted yet.");
        return;
    }

    complaints.forEach(complaint => {
        const card = createElement("article", "admin-complaint-card");
        const header = createElement("div", "admin-card-header");

        header.appendChild(
            createElement("h3", "", complaint.complaintId)
        );

        header.appendChild(
            createElement("span", "admin-status", complaint.status)
        );

        card.appendChild(header);

        const details = [
            ["Project", complaint.projectId],
            ["Problem", complaint.problemType],
            ["Location", complaint.location],
            ["Description", complaint.description],
            [
                "Submitted",
                complaint.submittedAt
                    ? new Date(complaint.submittedAt).toLocaleString()
                    : "Not available"
            ]
        ];

        details.forEach(([label, value]) => {
            const row = createElement("div", "admin-detail-row");

            row.appendChild(createElement("strong", "", label));
            row.appendChild(
                createElement("p", "", value || "Not provided")
            );

            card.appendChild(row);
        });

        const actions = createElement("div", "admin-actions");

        if (complaint.status === "Awaiting Verification") {
            actions.appendChild(
                createButton("Verify", "admin-verify", () => {
                    updateStatus(
                        complaint.complaintId,
                        "Verified - Ready for Action"
                    );
                })
            );

            actions.appendChild(
                createButton("Reject", "admin-reject", () => {
                    updateStatus(
                        complaint.complaintId,
                        "Not Verified"
                    );
                })
            );
        } else if (
            complaint.status === "Verified - Ready for Action"
        ) {
            actions.appendChild(
                createButton("Refer for Action", "admin-refer", () => {
                    updateStatus(
                        complaint.complaintId,
                        "Referred to Authority"
                    );
                })
            );
        } else {
            actions.appendChild(
                createElement(
                    "p",
                    "admin-status-note",
                    complaint.status === "Referred to Authority"
                        ? "Marked as referred. No authority was contacted automatically."
                        : "This complaint has been marked as not verified."
                )
            );
        }

        card.appendChild(actions);
        complaintList.appendChild(card);
    });
}

async function updateStatus(complaintId, status) {
    const token = getToken();

    const question = status === "Verified - Ready for Action"
        ? "Have you reviewed the evidence and verified this complaint?"
        : status === "Not Verified"
            ? "Have you reviewed the evidence and decided it is not verified?"
            : "Has this complaint actually been referred to the responsible authority?";

    if (!confirm(question)) return;

    try {
        const response = await fetch(
            `${API_URL}/admin/complaints/${encodeURIComponent(complaintId)}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update status.");
        }

        alert("Complaint status updated successfully.");
        await loadComplaints();

    } catch (error) {
        alert(
            error.message === "Failed to fetch"
                ? "Cannot connect to the backend."
                : error.message
        );
    }
}

loadComplaints();
