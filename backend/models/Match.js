/**
 * MATCH MODEL
 * Extends BaseService for database operations
 * Handles matches between lost and found items
 *
 * OOP & SOLID notes:
 * - Inheritance: builds on `BaseService` for data access.
 * - Single Responsibility (SRP): manages match creation, querying and status transitions only.
 * - Liskov Substitution (LSP): consumers expecting a BaseService can use this class interchangeably.
 */

const BaseService = require("../services/BaseService");

class Match extends BaseService {
    constructor() {
        super("matches");
    }

    /**
     * Create a match between lost and found items
     * @param {Object} matchData - Match data
     * @returns {Promise<number>} Match ID
     */
    async create(matchData) {
        // Validate
        if (!matchData.lost_item_id || !matchData.found_item_id || matchData.score === undefined) {
            throw new Error('lost_item_id, found_item_id, and score are required');
        }

        // Check if match already exists
        const existing = await this.findExisting(matchData.lost_item_id, matchData.found_item_id);
        if (existing) {
            // Update existing match score
            return await this.update(existing.id, {
                score: matchData.score,
                match_status: matchData.match_status || 'pending'
            });
        }

        const sanitized = {
            lost_item_id: matchData.lost_item_id,
            found_item_id: matchData.found_item_id,
            score: Math.round(Math.min(100, Math.max(0, matchData.score))),
            match_status: 'pending',
            is_active: true
        };

        return await super.create(sanitized);
    }

    /**
     * Find existing match between two items
     * @param {number} lostItemId - Lost item ID
     * @param {number} foundItemId - Found item ID
     * @returns {Promise<Object|null>} Match or null
     */
    async findExisting(lostItemId, foundItemId) {
        const results = await this.executeQuery(
            "SELECT * FROM matches WHERE lost_item_id = ? AND found_item_id = ?",
            [lostItemId, foundItemId]
        );

        return results.length > 0 ? results[0] : null;
    }

    /**
     * Find all matches for a lost item
     * @param {number} lostItemId - Lost item ID
     * @param {string} status - Filter by status (optional)
     * @returns {Promise<Array>} Matches with item details
     */
    async findByLostItem(lostItemId, status = null) {
        let query = `
            SELECT m.*, 
                   li.item_name as lost_item_name,
                   li.description as lost_description,
                   fi.item_name as found_item_name,
                   fi.description as found_description
            FROM matches m
            INNER JOIN lost_items li ON m.lost_item_id = li.id
            INNER JOIN found_items fi ON m.found_item_id = fi.id
            WHERE m.lost_item_id = ?
        `;

        const params = [lostItemId];

        if (status) {
            query += " AND m.match_status = ?";
            params.push(status);
        }

        query += " ORDER BY m.score DESC";

        return await this.executeQuery(query, params);
    }

    /**
     * Find all matches for a found item
     * @param {number} foundItemId - Found item ID
     * @param {string} status - Filter by status (optional)
     * @returns {Promise<Array>} Matches with item details
     */
    async findByFoundItem(foundItemId, status = null) {
        let query = `
            SELECT m.*,
                   li.item_name as lost_item_name,
                   li.description as lost_description,
                   fi.item_name as found_item_name,
                   fi.description as found_description
            FROM matches m
            INNER JOIN lost_items li ON m.lost_item_id = li.id
            INNER JOIN found_items fi ON m.found_item_id = fi.id
            WHERE m.found_item_id = ?
        `;

        const params = [foundItemId];

        if (status) {
            query += " AND m.match_status = ?";
            params.push(status);
        }

        query += " ORDER BY m.score DESC";

        return await this.executeQuery(query, params);
    }

    /**
     * Find high-quality matches (score >= threshold)
     * @param {number} minScore - Minimum score (default 70)
     * @param {number} limit - Max results
     * @returns {Promise<Array>} High-quality matches
     */
    async findHighQualityMatches(minScore = 70, limit = 100) {
        return await this.findAll(
            { is_active: true },
            ['score', 'DESC'],
            limit
        ).then(matches =>
            matches.filter(m => m.score >= minScore)
        );
    }

    /**
     * Update match status
     * @param {number} matchId - Match ID
     * @param {string} status - New status (pending, accepted, rejected, confirmed)
     * @returns {Promise<number>} Affected rows
     */
    async updateStatus(matchId, status) {
        const validStatuses = ['pending', 'accepted', 'rejected', 'confirmed'];

        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        return await this.update(matchId, { match_status: status });
    }

    /**
     * Accept a match (user confirmed it)
     * @param {number} matchId - Match ID
     * @returns {Promise<number>} Affected rows
     */
    async accept(matchId) {
        return await this.updateStatus(matchId, 'accepted');
    }

    /**
     * Reject a match
     * @param {number} matchId - Match ID
     * @returns {Promise<number>} Affected rows
     */
    async reject(matchId) {
        return await this.updateStatus(matchId, 'rejected');
    }

    /**
     * Confirm match (items successfully matched)
     * @param {number} matchId - Match ID
     * @returns {Promise<number>} Affected rows
     */
    async confirm(matchId) {
        return await this.updateStatus(matchId, 'confirmed');
    }

    /**
     * Get match statistics
     * @returns {Promise<Object>} Match statistics
     */
    async getStatistics() {
        const total = await this.count({ is_active: true });
        const confirmed = await this.count({ match_status: 'confirmed' });
        const accepted = await this.count({ match_status: 'accepted' });
        const pending = await this.count({ match_status: 'pending' });

        // Get average score
        const avgResult = await this.executeQuery(
            "SELECT AVG(score) as avg_score FROM matches WHERE is_active = TRUE"
        );

        return {
            total,
            confirmed,
            accepted,
            pending,
            average_score: Math.round(avgResult[0].avg_score || 0)
        };
    }

    /**
     * Find matches for user (both as owner of lost and found items)
     * @param {number} userId - User ID
     * @returns {Promise<Array>} User's matches
     */
    async findUserMatches(userId) {
        const query = `
            SELECT m.*,
                   li.user_id as lost_owner_id,
                   fi.user_id as found_owner_id,
                   li.item_name as lost_item_name,
                   fi.item_name as found_item_name
            FROM matches m
            INNER JOIN lost_items li ON m.lost_item_id = li.id
            INNER JOIN found_items fi ON m.found_item_id = fi.id
            WHERE li.user_id = ? OR fi.user_id = ?
            ORDER BY m.created_at DESC
        `;

        return await this.executeQuery(query, [userId, userId]);
    }

    /**
     * Deactivate old matches (cleanup)
     * @param {number} daysOld - Deactivate matches older than X days
     * @returns {Promise<number>} Affected rows
     */
    async deactivateOld(daysOld = 30) {
        return await this.executeQuery(
            `UPDATE matches 
             SET is_active = FALSE 
             WHERE is_active = TRUE 
             AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [daysOld]
        );
    }
}

// Export singleton instance
module.exports = new Match();
