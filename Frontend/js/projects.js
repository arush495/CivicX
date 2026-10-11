
/* CIVICX - Project Search and Status Filter */

const searchInput = document.getElementById("projectSearch");
const statusFilter = document.getElementById("statusFilter");
const projectCards = document.querySelectorAll(".project-card");
const projectCount = document.getElementById("projectCount");
const noProjectsMessage = document.getElementById("noProjectsMessage");

function filterProjects() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    let visibleCount = 0;

    projectCards.forEach(function (card) {
        const searchableText = (
            card.textContent + " " +
            (card.dataset.search || "")
        ).toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesStatus =
            selectedStatus === "all" ||
            card.dataset.status === selectedStatus;

        const shouldShow = matchesSearch && matchesStatus;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCount++;
        }
    });

    // Update result count in the selected language.
    const language = document.documentElement.lang;

    if (language === "hi") {
        projectCount.textContent =
            visibleCount + " नमूना परियोजनाएँ दिखाई जा रही हैं";
    } else {
        projectCount.textContent =
            "Showing " + visibleCount + " sample projects";
    }

    noProjectsMessage.hidden = visibleCount !== 0;
}

// Search while typing.
searchInput.addEventListener("input", filterProjects);

// Filter when status changes.
statusFilter.addEventListener("change", filterProjects);

// Run once when the page opens.
filterProjects();
