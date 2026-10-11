
/* CIVICX - Connect Signup and Login to Backend */

const API_URL = "http://localhost:3000/api";

function showAuthMessage(elementId, message, type) {
    const element = document.getElementById(elementId);

    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;
}

function getLanguage() {
    return document.documentElement.lang === "hi" ? "hi" : "en";
}

// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const language = getLanguage();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const dob = document.getElementById("dob").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;
        const ageConsent = document.getElementById("ageConsent").checked;
        const button = signupForm.querySelector('button[type="submit"]');

        if (password !== confirmPassword) {
            showAuthMessage(
                "signupMessage",
                language === "hi"
                    ? "Dono passwords match nahi karte."
                    : "The passwords do not match.",
                "error"
            );
            return;
        }

        if (!ageConsent) {
            showAuthMessage(
                "signupMessage",
                language === "hi"
                    ? "Age requirement confirm karein."
                    : "Please confirm the age requirement.",
                "error"
            );
            return;
        }

        button.disabled = true;
        button.textContent = language === "hi"
            ? "Account ban raha hai..."
            : "Creating account...";

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    dob,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed.");
            }

            signupForm.reset();

            showAuthMessage(
                "signupMessage",
                language === "hi"
                    ? "Account successfully ban gaya! Ab Login karein."
                    : "Account created successfully! You can now log in.",
                "success"
            );

        } catch (error) {
            showAuthMessage(
                "signupMessage",
                error.message === "Failed to fetch"
                    ? (language === "hi"
                        ? "Backend nahi mil raha. Check karein ki server chal raha hai."
                        : "Cannot reach the backend. Check that the server is running.")
                    : error.message,
                "error"
            );
        } finally {
            button.disabled = false;
            button.textContent = language === "hi"
                ? "खाता बनाएँ"
                : "Create Account";
        }
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const language = getLanguage();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const button = loginForm.querySelector('button[type="submit"]');

        button.disabled = true;
        button.textContent = language === "hi"
            ? "लॉगिन हो रहा है..."
            : "Logging in...";

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            // Temporary session storage for this local prototype.
            sessionStorage.setItem("civicxToken", data.token);
            sessionStorage.setItem(
                "civicxUser",
                JSON.stringify(data.user)
            );

            showAuthMessage(
                "loginMessage",
                language === "hi"
                    ? "Login successful! Aapka account verify ho gaya."
                    : "Login successful! Your account has been verified.",
                "success"
            );
            setTimeout(() => {
    window.location.href = "dashboard.html";
}, 1200);

        } catch (error) {
            showAuthMessage(
                "loginMessage",
                error.message === "Failed to fetch"
                    ? (language === "hi"
                        ? "Backend nahi mil raha. Check karein ki server chal raha hai."
                        : "Cannot reach the backend. Check that the server is running.")
                    : error.message,
                "error"
            );
        } finally {
            button.disabled = false;
            button.textContent = language === "hi"
                ? "CivicX में लॉगिन करें"
                : "Login to CivicX";
        }
    });
}
