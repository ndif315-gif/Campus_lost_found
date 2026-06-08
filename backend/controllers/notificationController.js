/**
 * NOTIFICATION CONTROLLER
 * Responsibility: fetch and return notifications for the authenticated user.
 * OOP/SOLID notes:
 * - Single Responsibility (SRP): controller only handles HTTP concerns.
 * - Interface Segregation (ISP): consumers get small focused endpoints (get notifications).
 * - Dependency Inversion (DIP): could be refactored to use a NotificationService abstraction.
 */

const Notification = require("../models/Notification");

/**
 * GET ALL NOTIFICATIONS FOR USER
 */
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll(
            { user_id: userId },
            ['created_at', 'DESC']
        );

        res.json({
            success: true,
            notifications: notifications || []
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve notifications"
        });
    }
};

/**
 * MARK NOTIFICATION AS READ
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findById(id);
        if (!notification || notification.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Notification.update(id, { is_read: true, read_at: new Date() });

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to update notification" });
    }
};

/**
 * MARK ALL AS READ
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `UPDATE notifications SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND is_read = 0`;
        await Notification.executeQuery(query, [userId]);
        
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update notifications" });
    }
};