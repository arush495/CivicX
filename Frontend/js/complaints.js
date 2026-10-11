
/* CIVICX - Backend Complaint Submission and Tracking */

const API_URL = "/api";

function showComplaintMessage(message, type) {
    const element = document.getElementById("complaintMessage");

    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;
}

function getLanguage() {
    return document.documentElement.lang === "hi" ? "hi" : "en";
}

// Submit a complaint to the backend database.
const complaintForm = document.getElementById("complaintForm");

if (complaintForm) {
    complaintForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const language = getLanguage();
        const token = sessionStorage.getItem("civicxToken");

        if (!token) {
            showComplaintMessage(
                language === "hi"
                    ? "Pehle login karein, phir complaint submit karein."
                    : "Please log in before submitting a complaint.",
                "error"
            );
            return;
        }

        const projectId =
            document.getElementById("projectName").value;

        const problemType =
            document.getElementById("problemType").value;

        const location =
            document.getElementById("problemLocation").value.trim();

        const description =
            document.getElementById("problemDescription").value.trim();

        const confirmation =
            document.getElementById("truthConfirmation").checked;

        if (!projectId || !problemType || !location || !description) {
            showComplaintMessage(
                language === "hi"
                    ? "Sabhi zaroori fields bharein."
                    : "Please complete all required fields.",
                "error"
            );
            return;
        }

        if (!confirmation) {
            showComplaintMessage(
                language === "hi"
                    ? "Apni report ki sachchai confirm karein."
                    : "Please confirm your report is truthful.",
                "error"
            );
            return;
        }

        const button = complaintForm.querySelector(
            'button[type="submit"]'
        );

        button.disabled = true;

        try {
            const response = await fetch(`${API_URL}/complaints`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    problemType,
                    location,
                    description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to submit complaint."
                );
            }

            const complaint = data.complaint;

            showComplaintMessage(
                (language === "hi"
                    ? "Complaint submit ho gayi! ID: "
                    : "Complaint submitted! ID: ") +
                complaint.complaintId +
                (language === "hi"
                    ? " | Status: Verification pending."
                    : " | Status: Awaiting Verification."),
                "success"
            );

            complaintForm.reset();

        } catch (error) {
            showComplaintMessage(
                error.message === "Failed to fetch"
                    ? (language === "hi"
                        ? "Backend se connection nahi ho raha."
                        : "Cannot connect to the backend.")
                    : error.message,
                "error"
            );
        } finally {
            button.disabled = false;
        }
    });
}

// Track complaints belonging to the logged-in user.
const trackForm = document.getElementById("trackForm");

if (trackForm) {
    trackForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const language = getLanguage();
        const token = sessionStorage.getItem("civicxToken");
        const enteredId = document.getElementById("complaintId")
            .value.trim().toUpperCase();

        const result = document.getElementById("trackResult");
        result.replaceChildren();

        if (!token) {
            result.textContent = language === "hi"
                ? "Apni complaint track karne ke liye login karein."
                : "Please log in to track your complaint.";
            result.className = "track-result track-error";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/complaints/mine`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not load complaints.");
            }

            const complaint = data.complaints.find(
                item => item.complaintId.toUpperCase() === enteredId
            );

            if (!complaint) {
                result.textContent = language === "hi"
                    ? "Is account mein ye Complaint ID nahi mili."
                    : "This Complaint ID was not found in your account.";
                result.className = "track-result track-error";
                return;
            }

            result.className = "track-result";

            const heading = document.createElement("h3");
            heading.textContent = language === "hi"
                ? "Complaint mil gayi"
                : "Complaint Found";

            result.appendChild(heading);

            const details = [
                ["Complaint ID", complaint.complaintId],
                ["Project", complaint.projectId],
                ["Location", complaint.location],
                ["Problem", complaint.problemType],
                ["Status", complaint.status],
                [
                    "Submitted",
                    new Date(complaint.submittedAt).toLocaleString(
                        language === "hi" ? "hi-IN" : "en-IN"
                    )
                ]
            ];

            details.forEach(([label, value]) => {
                const row = document.createElement("div");
                row.className = "track-row";

                const title = document.createElement("strong");
                title.textContent = label;

                const text = document.createElement("p");
                text.textContent = value || "Not available";

                row.append(title, text);
                result.appendChild(row);
            });

            const note = document.createElement("p");
            note.className = "track-note";
            note.textContent = language === "hi"
                ? "Complaint ka verification abhi alag admin step mein hoga."
                : "Complaint verification is handled separately by the review team.";

            result.appendChild(note);

        } catch (error) {
            result.textContent = error.message;
            result.className = "track-result track-error";
        }
    });
}
