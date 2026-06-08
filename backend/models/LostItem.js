/**
 * LOST ITEM MODEL
 * Extends BaseService for database operations
 * Handles lost item data with validation and matching
 */

const BaseService = require("../services/BaseService");
const { MatchEngine } = require("../utils/matchEngine");

class LostItem extends BaseService {
    constructor() {
        super("lost_items");
    }

    async findByUserId(userId) {
        return await this.findAll(
            { user_id: userId },
            ['created_at', 'DESC']
        );
    }

    async findSearching(limit = 100) {
        return await this.findAll(
            { status: 'searching' },
            ['created_at', 'DESC'],
            limit
        );
    }

    async create(itemData) {
        this.validateLostItemData(itemData);
        const sanitized = this.sanitizeLostItemData(itemData);
        return await super.create(sanitized);
    }

    async findMatches(lostItemId, minimumScore = 50) {
        const lostItem = await this.findById(lostItemId);
        if (!lostItem) return [];

        const foundItems = await this.executeQuery(
            "SELECT * FROM found_items WHERE status = 'available' AND user_id != ?",
            [lostItem.user_id]
        );

        return MatchEngine.findMatches(lostItem, foundItems, minimumScore);
    }

    async updateStatus(itemId, status) {
        const validStatuses = ['searching', 'found', 'collected'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        return await this.update(itemId, { status });
    }

    async findByIdWithImages(itemId) {
        const item = await this.findById(itemId);
        if (!item) return null;

        const images = await this.executeQuery(
            "SELECT * FROM item_images WHERE lost_item_id = ?",
            [itemId]
        );

        return {
            ...item,
            images: images || []
        };
    }

    async search(keyword, limit = 20) {
        if (!keyword || keyword.length < 2) return [];
        return await this.executeQuery(
            `SELECT * FROM lost_items
             WHERE status = 'searching' AND (
                item_name LIKE ? OR 
                description LIKE ? OR 
                category LIKE ? OR 
                color LIKE ?
             )
             ORDER BY created_at DESC
             LIMIT ?`,
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, limit]
        );
    }

    async getUserStats(userId) {
        const total = await this.count({ user_id: userId });
        const searching = await this.count({ user_id: userId, status: 'searching' });
        const found = await this.count({ user_id: userId, status: 'found' });
        const collected = await this.count({ user_id: userId, status: 'collected' });

        return { total, searching, found, collected };
    }

    validateLostItemData(data) {
        if (!data.user_id) throw new Error('User ID required');
        if (!data.category) throw new Error('Category required');
        if (!data.item_name) throw new Error('Item name required');
        if (!data.color) throw new Error('Color required');
        if (!data.description) throw new Error('Description required');
        if (!data.last_seen_location) throw new Error('Location required');
    }

    sanitizeLostItemData(data) {
        return {
            user_id: data.user_id,
            category: data.category.trim(),
            item_name: data.item_name.trim(),
            brand: data.brand ? data.brand.trim() : null,
            color: data.color.trim(),
            description: data.description.trim(),
            last_seen_location: data.last_seen_location.trim(),
            image_url: data.image_url || null,
            status: 'searching'
        };
    }

    async delete(itemId) {
        await this.executeQuery("DELETE FROM item_images WHERE lost_item_id = ?", [itemId]);
        await this.executeQuery("DELETE FROM matches WHERE lost_item_id = ?", [itemId]);
        await this.executeQuery("DELETE FROM notifications WHERE lost_item_id = ?", [itemId]);
        return await super.delete(itemId);
    }
}

module.exports = new LostItem();
