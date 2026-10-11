
const savedUser = sessionStorage.getItem("civicxUser");
const token = sessionStorage.getItem("civicxToken");

// Send unauthenticated users back to login.
if (!savedUser || !token) {
    window.location.replace("login.html");
} else {
    try {
        const user = JSON.parse(savedUser);
        const language =
            document.documentElement.lang === "hi" ? "hi" : "en";

        const welcome = document.getElementById("welcomeUser");

        if (welcome && user.fullName) {
            welcome.textContent = language === "hi"
                ? "स्वागत है, " + user.fullName + "! अपनी परियोजनाएँ और रिपोर्ट देखें।"
                : "Welcome, " + user.fullName + "! Explore your projects and reports.";
        }
    } catch (error) {
        sessionStorage.removeItem("civicxUser");
        sessionStorage.removeItem("civicxToken");
        window.location.replace("login.html");
    }
}

// Count demo complaints saved in this browser.
try {
    const complaints = JSON.parse(
        localStorage.getItem("civicxComplaints") || "[]"
    );

    document.getElementById("reportCount").textContent =
        Array.isArray(complaints) ? complaints.length : 0;
} catch (error) {
    document.getElementById("reportCount").textContent = "0";
}

// Demo logout
document.getElementById("logoutButton").addEventListener("click", function () {
    sessionStorage.removeItem("civicxToken");
    sessionStorage.removeItem("civicxUser");
    window.location.href = "login.html";
});
