
/* CIVICX - English and Hindi Language Switch */

const languageSelect = document.getElementById("languageSelect");

const translations = {
    en: {
        tagline: "Transparency. Verified.",

        signup: {
            title: "Create your account",
            description: "Join CivicX to explore public projects, report problems and track verified complaints.",
            fullName: "Full Name",
            email: "Email Address",
            dob: "Date of Birth",
            password: "Create Password",
            confirmPassword: "Confirm Password",
            ageConfirm: "I confirm that I am at least 16 years old.",
            button: "Create Account",
            terms: "Please provide accurate information. Your account details should be protected. Applicable age and privacy requirements must be met before real-world deployment.",
            footer: "Already have an account?",
            link: "Login here"
        },

        login: {
            title: "Welcome Back!",
            description: "Login to CivicX to track public projects, view verified information and manage your complaints.",
            email: "Email Address",
            password: "Password",
            emailPlaceholder: "Enter your email",
            passwordPlaceholder: "Enter your password",
            button: "Login to CivicX",
            footer: "Don't have an account?",
            signupLink: "Create Account",
            exploreLink: "Explore CivicX"
        }
    },

    hi: {
        tagline: "पारदर्शिता। सत्यापन।",

        signup: {
            title: "अपना खाता बनाएँ",
            description: "सरकारी परियोजनाएँ देखने, समस्याएँ दर्ज करने और शिकायतों की स्थिति जानने के लिए CivicX से जुड़ें।",
            fullName: "पूरा नाम",
            email: "ईमेल पता",
            dob: "जन्म तिथि",
            password: "पासवर्ड बनाएँ",
            confirmPassword: "पासवर्ड दोबारा लिखें",
            ageConfirm: "मैं पुष्टि करता/करती हूँ कि मेरी उम्र कम से कम 16 वर्ष है।",
            button: "खाता बनाएँ",
            terms: "कृपया सही जानकारी दें। आपके खाते की जानकारी सुरक्षित रखी जानी चाहिए। वास्तविक उपयोग से पहले लागू आयु और गोपनीयता नियमों का पालन जरूरी है।",
            footer: "क्या आपका पहले से खाता है?",
            link: "यहाँ लॉगिन करें"
        },

        login: {
            title: "वापस स्वागत है!",
            description: "सरकारी परियोजनाओं की जानकारी देखने और अपनी शिकायतों का प्रबंधन करने के लिए CivicX में लॉगिन करें।",
            email: "ईमेल पता",
            password: "पासवर्ड",
            emailPlaceholder: "अपना ईमेल दर्ज करें",
            passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
            button: "CivicX में लॉगिन करें",
            footer: "क्या आपका खाता नहीं है?",
            signupLink: "खाता बनाएँ",
            exploreLink: "CivicX देखें"
        }
    }
};

function changeText(selector, text) {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = text;
    }
}

function changeLabel(fieldId, text) {
    const label = document.querySelector(
        'label[for="' + fieldId + '"]'
    );

    if (label) {
        label.textContent = text;
    }
}

function changePlaceholder(fieldId, text) {
    const field = document.getElementById(fieldId);

    if (field) {
        field.placeholder = text;
    }
}

function changeFooterText(footer, text) {
    if (!footer) return;

    const textNode = Array.from(footer.childNodes).find(
        node =>
            node.nodeType === Node.TEXT_NODE &&
            node.textContent.trim() !== ""
    );

    if (textNode) {
        textNode.textContent = "\n                " + text + "\n                ";
    }
}

function setLanguage(language) {
    const lang = translations[language] ? language : "en";
    const t = translations[lang];

    document.documentElement.lang = lang;
    
    // Translate homepage text marked with data-en and data-hi.
    document.querySelectorAll("[data-en][data-hi]").forEach(element => {
        // Keep nested headings intact; translate their child spans separately.
        if (element.querySelector("[data-en][data-hi]")) {
            return;
        }

        element.textContent = element.getAttribute("data-" + lang);
    });


    changeText(".tagline", t.tagline);

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    if (signupForm) {
        const s = t.signup;

        changeText(".auth-card h1", s.title);
        changeText(".auth-description", s.description);

        changeLabel("fullName", s.fullName);
        changeLabel("email", s.email);
        changeLabel("dob", s.dob);
        changeLabel("password", s.password);
        changeLabel("confirmPassword", s.confirmPassword);

        changePlaceholder("fullName", lang === "hi" ? "अपना नाम दर्ज करें" : "Enter your full name");
        changePlaceholder("email", lang === "hi" ? "अपना ईमेल दर्ज करें" : "Enter your email");
        changePlaceholder("password", lang === "hi" ? "पासवर्ड बनाएँ" : "Create a password");
        changePlaceholder("confirmPassword", lang === "hi" ? "पासवर्ड दोबारा दर्ज करें" : "Enter password again");

        const ageCheckbox = document.getElementById("ageConsent");

        if (ageCheckbox && ageCheckbox.parentElement) {
            const textNode = Array.from(
                ageCheckbox.parentElement.childNodes
            ).find(
                node =>
                    node.nodeType === Node.TEXT_NODE &&
                    node.textContent.trim() !== ""
            );

            if (textNode) {
                textNode.textContent = " " + s.ageConfirm;
            }
        }

        changeText("#signupForm button[type='submit']", s.button);
        changeText(".terms-note", s.terms);

        const footer = document.querySelector(".auth-footer");
        changeFooterText(footer, s.footer);
        changeText('.auth-footer a[href="login.html"]', s.link);
    }

    if (loginForm) {
        const l = t.login;

        changeText(".auth-card h1", l.title);
        changeText(".auth-description", l.description);

        changeLabel("email", l.email);
        changeLabel("password", l.password);

        changePlaceholder("email", l.emailPlaceholder);
        changePlaceholder("password", l.passwordPlaceholder);

        changeText("#loginForm button[type='submit']", l.button);

        const footer = document.querySelector(".auth-footer");
        changeFooterText(footer, l.footer);

        changeText('.auth-footer a[href="signup.html"]', l.signupLink);
        changeText('.auth-footer a[href="index.html"]', l.exploreLink);
    }

    try {
        localStorage.setItem("civicxLanguage", lang);
    } catch (error) {
        // Language switching still works if storage is unavailable.
    }
}

if (languageSelect) {
    let savedLanguage = "en";

    try {
        savedLanguage = localStorage.getItem("civicxLanguage") || "en";
    } catch (error) {
        // Use English as the default.
    }

    languageSelect.value = translations[savedLanguage]
        ? savedLanguage
        : "en";

    setLanguage(languageSelect.value);

    languageSelect.addEventListener("change", function () {
        setLanguage(languageSelect.value);
    });
}
