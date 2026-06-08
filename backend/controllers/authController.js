/**
 * AUTHENTICATION CONTROLLER
 * Handles user registration, login, and token management
 * 
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token generation
 * - Input validation and sanitization
 * - Error handling and logging
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long" };
    }

    // Optional: Add more strict requirements
    // if (!/[A-Z]/.test(password)) {
    //     return { valid: false, message: "Password must contain uppercase letter" };
    // }

    return { valid: true };
}

/**
 * USER REGISTRATION
 * Create new user account
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const {
            full_name,
            student_id,
            email,
            password,
            language
        } = req.body;

        // ===== INPUT VALIDATION =====

        // Validate required fields
        if (!full_name || !student_id || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // ===== DUPLICATE CHECK =====

        // Check if email already exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Check if student ID already exists
        const existingStudent = await User.findByStudentId(student_id);
        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Student ID already registered"
            });
        }

        // ===== PASSWORD HASHING =====

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ===== CREATE USER =====

        const userId = await User.create({
            full_name: full_name.trim(),
            student_id: student_id.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            language: language || "en"
        });

        // ===== GENERATE TOKEN =====

        const token = jwt.sign(
            { id: userId, email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        // ===== SUCCESS RESPONSE =====

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            userId,
            userName: full_name
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                success: false,
                message: "Email or Student ID already registered"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

/**
 * USER LOGIN
 * Authenticate user and return JWT token
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ===== INPUT VALIDATION =====

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        // ===== USER LOOKUP + AUTHENTICATION =====

        const user = await User.authenticate(email.toLowerCase().trim(), password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // ===== TOKEN GENERATION =====

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "7d" }
        );

        // ===== UPDATE LAST LOGIN =====

        await User.updateLastLogin(user.id);

        // ===== SUCCESS RESPONSE =====

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            userId: user.id,
            userName: user.full_name,
            userEmail: user.email,
            language: user.language
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

/**
 * VERIFY TOKEN
 * Check if JWT token is valid
 * POST /api/auth/verify
 */
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-key"
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                student_id: user.student_id,
                language: user.language
            }
        });

    } catch (error) {
        console.error("Token verification error:", error);

        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

/**
 * CHANGE PASSWORD
 * Allow user to change their password
 * POST /api/auth/changePassword
 */
exports.changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Validate inputs
        if (!old_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Old and new passwords required"
            });
        }

        // Get user with password for verification
        const user = await User.findByIdWithPassword(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify old password
        const isValid = await bcrypt.compare(old_password, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid current password"
            });
        }

        // Validate new password
        const validation = validatePassword(new_password);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // Hash and update
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await User.update(userId, { password: hashedPassword });

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Password change error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



