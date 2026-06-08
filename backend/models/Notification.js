/**
 * NOTIFICATION MODEL
 * Extends BaseService for database operations
 * Handles notifications for users about matches and updates
 *
 * OOP & SOLID notes:
 * - Inheritance: uses `BaseService` CRUD helpers.
 * - Single Responsibility (SRP): creates and retrieves notifications only.
 * - Interface Segregation (ISP): exposes focused methods like `sendMatchNotifications` and `getUnread`.
 */

const BaseService = require("../services/BaseService");

class Notification extends BaseService {
    constructor() {
        super("notifications");
    }

    /**
     * Create notification with validation
     * @param {Object} notificationData - Notification data
     * @returns {Promise<number>} Notification ID
     */
    async create(notificationData) {
        // Validate
        if (!notificationData.user_id || !notificationData.message) {
            throw new Error('user_id and message are required');
        }

        const sanitized = {
            user_id: notificationData.user_id,
            match_id: notificationData.match_id || null,
            type: notificationData.type || 'match',
            title: notificationData.title || null,
            message: notificationData.message.trim(),
            score: notificationData.score || null,
            action_url: notificationData.action_url || null,
            is_read: false
        };

        return await super.create(sanitized);
    }

    /**
     * Send notification about a match to relevant users
     * @param {Object} match - Match object with details
     * @returns {Promise<Array>} Created notification IDs
     */
    async sendMatchNotifications(match) {
        const notificationIds = [];

        // Notify lost item owner
        const lostOwnerNotifId = await this.create({
            user_id: match.lostItem.user_id,
            match_id: match.id,
            type: 'match',
            title: `Potential Match Found for "${match.lostItem.item_name}"`,
            message: `We found a potential match! Someone reported finding a ${match.foundItem.color} ${match.foundItem.item_name} at ${match.foundItem.found_location}. Match score: ${match.score}%`,
            score: match.score,
            action_url: `/notifications.html`
        });
        notificationIds.push(lostOwnerNotifId);

        // Notify found item owner
        const foundOwnerNotifId = await this.create({
            user_id: match.foundItem.user_id,
            match_id: match.id,
            type: 'match',
            title: `Potential Owner Found for "${match.foundItem.item_name}"`,
            message: `Someone reported losing a ${match.lostItem.color} ${match.lostItem.item_name} at ${match.lostItem.last_seen_location}. This might match what you found! Match score: ${match.score}%`,
            score: match.score,
            action_url: `/notifications.html`
        });
        notificationIds.push(foundOwnerNotifId);

        return notificationIds;
    }

    /**
     * Get unread notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Unread notifications
     */
    async getUnread(userId) {
        return await this.findAll(
            { user_id: userId, is_read: false },
            ['created_at', 'DESC']
        );
    }

    /**
     * Get all notifications for a user
     * @param {number} userId - User ID
     * @param {number} limit - Max results
     * @returns {Promise<Array>} User notifications
     */
    async findByUserId(userId, limit = 50) {
        return await this.findAll(
            { user_id: userId },
            ['created_at', 'DESC'],
            limit
        );
    }

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @returns {Promise<number>} Affected rows
     */
    async markAsRead(notificationId) {
        return await this.update(notificationId, {
            is_read: true,
            read_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
    }

    /**
     * Mark all notifications for user as read
     * @param {number} userId - User ID
     * @returns {Promise<number>} Affected rows
     */
    async markAllAsRead(userId) {
        return await this.executeQuery(
            `UPDATE notifications 
             SET is_read = true, read_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND is_read = false`,
            [userId]
        );
    }

    /**
     * Get unread count for a user
     * @param {number} userId - User ID
     * @returns {Promise<number>} Count of unread notifications
     */
    async getUnreadCount(userId) {
        return await this.count({ user_id: userId, is_read: false });
    }

    /**
     * Delete old notifications (cleanup)
     * @param {number} daysOld - Delete notifications older than X days (default 30)
     * @returns {Promise<number>} Affected rows
     */
    async deleteOld(daysOld = 30) {
        return await this.executeQuery(
            `DELETE FROM notifications 
             WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [daysOld]
        );
    }

    /**
     * Get notification statistics
     * @returns {Promise<Object>} Notification statistics
     */
    async getStatistics() {
        const total = await this.count();

        const unread = await this.count({ is_read: false });

        const byType = await this.executeQuery(
            "SELECT type, COUNT(*) as count FROM notifications GROUP BY type"
        );

        return {
            total,
            unread,
            byType: byType.reduce((acc, item) => {
                acc[item.type] = item.count;
                return acc;
            }, {})
        };
    }

    /**
     * Find notification with related match details
     * @param {number} notificationId - Notification ID
     * @returns {Promise<Object|null>} Notification with details
     */
    async findByIdWithMatch(notificationId) {
        const results = await this.executeQuery(
            `SELECT n.*, 
                    m.score,
                    li.item_name as lost_item_name,
                    li.description as lost_description,
                    li.color as lost_color,
                    li.last_seen_location,
                    fi.item_name as found_item_name,
                    fi.description as found_description,
                    fi.color as found_color,
                    fi.found_location
             FROM notifications n
             LEFT JOIN matches m ON n.match_id = m.id
             LEFT JOIN lost_items li ON m.lost_item_id = li.id
             LEFT JOIN found_items fi ON m.found_item_id = fi.id
             WHERE n.id = ?`,
            [notificationId]
        );

        return results.length > 0 ? results[0] : null;
    }
}

// Export singleton instance
module.exports = new Notification();
