/**
 * FOUND ITEM MODEL
 * Extends BaseService for database operations
 * Handles found item data with validation and matching
 */

const BaseService = require("../services/BaseService");
const { MatchEngine } = require("../utils/matchEngine");

class FoundItem extends BaseService {
    constructor() {
        super("found_items");
    }

    async findByUserId(userId) {
        return await this.findAll(
            { user_id: userId },
            ['created_at', 'DESC']
        );
    }

    async findAvailable(limit = 100) {
        return await this.findAll(
            { status: 'available' },
            ['created_at', 'DESC'],
            limit
        );
    }

    async create(itemData) {
        this.validateFoundItemData(itemData);
        const sanitized = this.sanitizeFoundItemData(itemData);
        return await super.create(sanitized);
    }

    async findMatches(foundItemId, minimumScore = 50) {
        const foundItem = await this.findById(foundItemId);
        if (!foundItem) return [];

        const lostItems = await this.executeQuery(
            "SELECT * FROM lost_items WHERE status = 'searching' AND user_id != ?",
            [foundItem.user_id]
        );

        const matches = [];
        for (const lostItem of lostItems) {
            const score = MatchEngine.calculateScore(lostItem, foundItem);
            if (score >= minimumScore) {
                matches.push({
                    lost_item_id: lostItem.id,
                    found_item_id: foundItemId,
                    score: score,
                    lostItem,
                    foundItem
                });
            }
        }
        return matches.sort((a, b) => b.score - a.score);
    }

    async updateStatus(itemId, status) {
        const validStatuses = ['available', 'claimed', 'returned'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        return await this.update(itemId, { status });
    }

    async findByIdWithImages(itemId) {
        const item = await this.findById(itemId);
        if (!item) return null;

        const images = await this.executeQuery(
            "SELECT * FROM item_images WHERE found_item_id = ?",
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
            `SELECT * FROM found_items
             WHERE status = 'available' AND (
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
        const available = await this.count({ user_id: userId, status: 'available' });
        const claimed = await this.count({ user_id: userId, status: 'claimed' });
        const returned = await this.count({ user_id: userId, status: 'returned' });

        return { total, available, claimed, returned };
    }

    validateFoundItemData(data) {
        if (!data.user_id) throw new Error('User ID required');
        if (!data.category) throw new Error('Category required');
        if (!data.item_name) throw new Error('Item name required');
        if (!data.color) throw new Error('Color required');
        if (!data.description) throw new Error('Description required');
        if (!data.found_location) throw new Error('Location required');
    }

    sanitizeFoundItemData(data) {
        return {
            user_id: data.user_id,
            category: data.category.trim(),
            item_name: data.item_name.trim(),
            brand: data.brand ? data.brand.trim() : null,
            color: data.color.trim(),
            description: data.description.trim(),
            found_location: data.found_location.trim(),
            image_url: data.image_url || null,
            status: 'available'
        };
    }

    async delete(itemId) {
        await this.executeQuery("DELETE FROM item_images WHERE found_item_id = ?", [itemId]);
        await this.executeQuery("DELETE FROM matches WHERE found_item_id = ?", [itemId]);
        await this.executeQuery("DELETE FROM notifications WHERE found_item_id = ?", [itemId]);
        return await super.delete(itemId);
    }
}

module.exports = new FoundItem();
