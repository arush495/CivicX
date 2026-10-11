const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("./db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Error: JWT_SECRET is missing from Backend/.env");
    process.exit(1);
}

app.use(cors({
    origin: [
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/admin", require("./routes/admin"));
// Calculate age from YYYY-MM-DD date of birth.
function calculateAge(dob) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        return -1;
    }

    const birthDate = new Date(dob + "T00:00:00.000Z");

    if (
        Number.isNaN(birthDate.getTime()) ||
        birthDate.toISOString().slice(0, 10) !== dob
    ) {
        return -1;
    }

    const today = new Date();
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();

    if (
        today.getUTCMonth() < birthDate.getUTCMonth() ||
        (
            today.getUTCMonth() === birthDate.getUTCMonth() &&
            today.getUTCDate() < birthDate.getUTCDate()
        )
    ) {
        age--;
    }

    return age;
}

// Basic health check.
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "CivicX backend is running."
    });
});

// User registration.
app.post("/api/auth/register", async (req, res) => {
    try {
        const { fullName, email, dob, password } = req.body;

        if (
            typeof fullName !== "string" ||
            typeof email !== "string" ||
            typeof dob !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        const name = fullName.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!name || name.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid name."
            });
        }

        if (
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (calculateAge(dob) < 16) {
            return res.status(400).json({
                success: false,
                message: "Registration is limited to users aged 16 or above."
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must be 8 or more characters and no more than 72 UTF-8 bytes."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = db.prepare(`
            INSERT INTO users
                (full_name, email, date_of_birth, password_hash)
            VALUES (?, ?, ?, ?)
        `).run(name, normalizedEmail, dob, passwordHash);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: result.lastInsertRowid,
                fullName: name,
                email: normalizedEmail
            }
        });

    } catch (error) {
        if (
            error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            error.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
        ) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        console.error("Registration failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create account right now."
        });
    }
});

// User login.
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            email.length > 254 ||
            password.length > 1024
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email and password."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = db.prepare(`
            SELECT id, full_name, email, password_hash
            FROM users
            WHERE email = ?
        `).get(normalizedEmail);

        if (
            !user ||
            !(await bcrypt.compare(password, user.password_hash))
        ) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        const token = jwt.sign(
            {
                sub: String(user.id),
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to login right now."
        });
    }
});
app.use(express.static(path.join(__dirname, "../Frontend")));
app.listen(PORT,"0.0.0.0", () => {
    console.log(`CivicX backend running at http://localhost:${PORT}`);
});
