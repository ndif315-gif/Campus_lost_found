/**
 * USER MODEL
 * Extends BaseService for database operations
 * Handles user data with proper validation and sanitization
 *
 * OOP & SOLID notes:
 * - Inheritance: leverages `BaseService` for common DB operations.
 * - Single Responsibility (SRP): focuses on user validation, sanitization and user-specific queries.
 * - Open/Closed (OCP): new user-related behaviors can be added in this class or separate services without changing BaseService.
 */

const bcrypt = require("bcryptjs");
const BaseService = require("../services/BaseService");

class User extends BaseService {
    constructor() {
        super("users");
    }

    /**
     * Find user by email
     * @param {string} email - Email address
     * @returns {Promise<Object|null>} User object or null
     */
    async findByEmail(email) {
        if (!email) return null;

        const results = await this.executeQuery(
            "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
            [email]
        );

        return results.length > 0 ? results[0] : null;
    }

    /**
     * Find user by email including hashed password.
     * @param {string} email - Email address
     * @returns {Promise<Object|null>} User object or null
     */
    async findByEmailWithPassword(email) {
        return this.findByEmail(email);
    }

    /**
     * Authenticate user with email and password.
     * @param {string} email - Email address
     * @param {string} password - Plain text password
     * @returns {Promise<Object|null>} Authenticated user or null
     */
    async authenticate(email, password) {
        if (!email || !password) return null;

        const user = await this.findByEmailWithPassword(email);
        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        delete user.password;
        return user;
    }

    /**
     * Find user by student ID
     * @param {string} studentId - Student ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findByStudentId(studentId) {
        if (!studentId) return null;

        const results = await this.executeQuery(
            "SELECT * FROM users WHERE student_id = ?",
            [studentId]
        );

        return results.length > 0 ? results[0] : null;
    }

    /**
     * Find user by ID (includes all public data)
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findById(id) {
        const user = await super.findById(id);

        if (user) {
            // Remove sensitive data
            delete user.password;
        }

        return user;
    }

    /**
     * Find user by ID including hashed password
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findByIdWithPassword(id) {
        if (!id || typeof id !== 'number') return null;

        const results = await this.executeQuery(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id]
        );

        return results.length > 0 ? results[0] : null;
    }

    /**
     * Create new user with validation
     * @param {Object} userData - User data
     * @returns {Promise<number>} User ID
     */
    async create(userData) {
        // Validate data
        this.validateUserData(userData);

        // Sanitize data
        const sanitized = this.sanitizeUserData(userData);

        // Create user
        return await super.create(sanitized);
    }

    /**
     * Update user with validation
     * @param {number} id - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<number>} Number of affected rows
     */
    async update(id, updateData) {
        // Validate
        if (!id || typeof id !== 'number') {
            throw new Error('Invalid user ID');
        }

        // Sanitize
        const sanitized = this.sanitizeUserData(updateData);

        // Update
        return await super.update(id, sanitized);
    }

    /**
     * Update last login timestamp
     * @param {number} id - User ID
     * @returns {Promise<void>}
     */
    /**
 * Update last login timestamp
 * Gracefully handles databases that do not have a last_login column
 *
 * @param {number} id - User ID
 * @returns {Promise<void>}
 */
async updateLastLogin(id) {
    try {
        await this.executeQuery(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
            [id]
        );
    } catch (error) {
        // Ignore missing column errors so login can continue
        if (
            error.code === "ER_BAD_FIELD_ERROR" ||
            error.message.includes("last_login")
        ) {
            console.warn(
                "last_login column not found in users table. Skipping login timestamp update."
            );
            return;
        }

        throw error;
    }
}
    async getProfileWithStats(id) {
        const user = await this.findById(id);
        if (!user) return null;

        // Get item counts
        const lostCount = await this.executeQuery(
            "SELECT COUNT(*) as count FROM lost_items WHERE user_id = ?",
            [id]
        );

        const foundCount = await this.executeQuery(
            "SELECT COUNT(*) as count FROM found_items WHERE user_id = ?",
            [id]
        );

        const matchCount = await this.executeQuery(
            `SELECT COUNT(DISTINCT m.id) as count FROM matches m
             INNER JOIN lost_items li ON m.lost_item_id = li.id
             INNER JOIN found_items fi ON m.found_item_id = fi.id
             WHERE li.user_id = ? OR fi.user_id = ?`,
            [id, id]
        );

        return {
            ...user,
            stats: {
                lost_items: lostCount[0].count,
                found_items: foundCount[0].count,
                matches: matchCount[0].count
            }
        };
    }

    /**
     * Validate user data
     * @param {Object} data - Data to validate
     * @throws {Error} If validation fails
     */
    validateUserData(data) {
        if (!data.full_name || data.full_name.length < 2) {
            throw new Error('Full name must be at least 2 characters');
        }

        if (!data.student_id || data.student_id.length < 3) {
            throw new Error('Student ID must be at least 3 characters');
        }

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new Error('Invalid email format');
        }

        if (!data.password || data.password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        if (data.language && !['en', 'fr'].includes(data.language)) {
            throw new Error('Language must be either "en" or "fr"');
        }
    }

    /**
     * Sanitize user data
     * @param {Object} data - Data to sanitize
     * @returns {Object} Sanitized data
     */
    sanitizeUserData(data) {
        const sanitized = {};

        if (data.full_name) {
            sanitized.full_name = data.full_name.trim();
        }

        if (data.student_id) {
            sanitized.student_id = data.student_id.trim();
        }

        if (data.email) {
            sanitized.email = data.email.toLowerCase().trim();
        }

        if (data.password) {
            sanitized.password = data.password;
        }

        if (data.phone) {
            sanitized.phone = data.phone.trim();
        }

        if (data.language) {
            sanitized.language = data.language;
        }

        if (data.profile_image) {
            sanitized.profile_image = data.profile_image;
        }

        return sanitized;
    }

    /**
     * Search users by name or student ID
     * @param {string} query - Search query
     * @returns {Promise<Array>} Matching users
     */
    async search(query) {
        if (!query || query.length < 2) return [];

        const results = await this.executeQuery(
            `SELECT id, full_name, student_id, email FROM users
             WHERE full_name LIKE ? OR student_id LIKE ?
             LIMIT 10`,
            [`%${query}%`, `%${query}%`]
        );

        return results;
    }

    /**
     * Delete user (soft delete - just mark as inactive)
     * @param {number} id - User ID
     * @returns {Promise<number>} Affected rows
     */
    async delete(id) {
        return await this.update(id, { is_active: false });
    }

    /**
     * Permanently delete user (use with caution)
     * @param {number} id - User ID
     * @returns {Promise<number>} Affected rows
     */
    async hardDelete(id) {
        return await super.delete(id);
    }
}

// Export singleton instance
module.exports = new User();
