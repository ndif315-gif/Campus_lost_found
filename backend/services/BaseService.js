/**
 * BASE SERVICE CLASS
 * Implements OOP principles and SOLID guidelines
 * All backend services should extend this class
 * 
 * SOLID Principles:
 * S - Single Responsibility: Each method has one purpose
 * O - Open/Closed: Open for extension, closed for modification
 * L - Liskov Substitution: Subclasses can replace parent without breaking
 * I - Interface Segregation: No unnecessary dependencies
 * D - Dependency Inversion: Depend on abstractions, not concrete implementations
 */

const db = require('../config/db');

class BaseService {
    /**
     * Constructor
     * @param {string} tableName - Name of the database table
     */
    constructor(tableName) {
        this.tableName = tableName;
    }

    /**
     * Execute a custom query
     * @param {string} query - SQL query
     * @param {Array} values - Query parameters
     * @returns {Promise<Array>} Query results
     * @throws {Error} Database error
     */
    async executeQuery(query, values = []) {
        try {
            const [results] = await db.execute(query, values);
            return results;
        } catch (error) {
            console.error(`Database error in ${this.tableName}:`, error);
            throw new Error(`Database operation failed: ${error.message}`);
        }
    }

    /**
     * Find a single record by ID
     * @param {number} id - Record ID
     * @returns {Promise<Object|null>} Record or null if not found
     */
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const results = await this.executeQuery(query, [id]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Find records with conditions
     * @param {Object} conditions - Object with column:value pairs
     * @param {Array} orderBy - Optional order: [column, 'ASC'|'DESC']
     * @param {number} limit - Optional limit
     * @returns {Promise<Array>} Matching records
     */
    async findAll(conditions = {}, orderBy = null, limit = null) {
        let query = `SELECT * FROM ${this.tableName}`;

        // Add WHERE conditions
        if (Object.keys(conditions).length > 0) {
            const where = Object.keys(conditions)
                .map(key => `${key} = ?`)
                .join(' AND ');
            query += ` WHERE ${where}`;
        }

        // Add ORDER BY
        if (orderBy && Array.isArray(orderBy) && orderBy.length === 2) {
            query += ` ORDER BY ${orderBy[0]} ${orderBy[1]}`;
        }

        // Add LIMIT
        if (limit && typeof limit === 'number' && limit > 0) {
            query += ` LIMIT ${limit}`;
        }

        const values = Object.values(conditions);
        return await this.executeQuery(query, values);
    }

    /**
     * Create a new record
     * @param {Object} data - Record data
     * @returns {Promise<number>} ID of created record
     */
    async create(data) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');

        const query = `
            INSERT INTO ${this.tableName} (${columns.join(', ')})
            VALUES (${placeholders})
        `;

        const result = await this.executeQuery(query, values);
        return result.insertId || result.lastInsertRowid;
    }

    /**
     * Update a record by ID
     * @param {number} id - Record ID
     * @param {Object} data - Data to update
     * @returns {Promise<number>} Number of affected rows
     */
    async update(id, data) {
        const updates = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        
        const values = [...Object.values(data), id];

        const query = `
            UPDATE ${this.tableName}
            SET ${updates}
            WHERE id = ?
        `;

        const result = await this.executeQuery(query, values);
        return result.affectedRows || result.changes;
    }

    /**
     * Delete a record by ID
     * @param {number} id - Record ID
     * @returns {Promise<number>} Number of deleted rows
     */
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await this.executeQuery(query, [id]);
        return result.affectedRows || result.changes;
    }

    /**
     * Count records matching conditions
     * @param {Object} conditions - Query conditions
     * @returns {Promise<number>} Count of records
     */
    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;

        if (Object.keys(conditions).length > 0) {
            const where = Object.keys(conditions)
                .map(key => `${key} = ?`)
                .join(' AND ');
            query += ` WHERE ${where}`;
        }

        const values = Object.values(conditions);
        const results = await this.executeQuery(query, values);
        return results[0].count;
    }

    /**
     * Check if a record exists
     * @param {Object} conditions - Query conditions
     * @returns {Promise<boolean>} True if record exists
     */
    async exists(conditions) {
        const count = await this.count(conditions);
        return count > 0;
    }

    /**
     * Validate input data (override in subclasses)
     * @param {Object} data - Data to validate
     * @throws {Error} If validation fails
     */
    validateData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data provided');
        }
    }

    /**
     * Sanitize data (override in subclasses)
     * @param {Object} data - Data to sanitize
     * @returns {Object} Sanitized data
     */
    sanitizeData(data) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            // Basic sanitization: trim strings
            if (typeof value === 'string') {
                sanitized[key] = value.trim();
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}

module.exports = BaseService;
