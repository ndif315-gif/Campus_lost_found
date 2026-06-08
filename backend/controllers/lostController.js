/**
 * LOST ITEM CONTROLLER
 * Handles all lost item operations
 * 
 * Endpoints:
 * POST /api/lost/create - Create new lost item
 * GET /api/lost/myItems - Get user's lost items
 * GET /api/lost/:id - Get specific lost item
 * PUT /api/lost/:id - Update lost item
 * DELETE /api/lost/:id - Delete lost item
 * GET /api/lost/search - Search lost items
 * GET /api/lost/:id/matches - Get matches for lost item
 */

const LostItem = require("../models/LostItem");
const Notification = require("../models/Notification");
const Match = require("../models/Match");

/**
 * CREATE LOST ITEM
 * POST /api/lost/create
 */
exports.createLostItem = async (req, res) => {
    try {
        const {
            category,
            item_name,
            brand,
            color,
            description,
            last_seen_location
        } = req.body;

        const userId = req.user?.id;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Create lost item
        const itemId = await LostItem.create({
            user_id: userId,
            category,
            item_name,
            brand: brand || null,
            color,
            description,
            last_seen_location,
            image_url: imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Lost item reported successfully",
            itemId,
            image_url: imageUrl
        });

    } catch (error) {
        console.error("Create lost item error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Failed to create lost item"
        });
    }
};

/**
 * GET USER'S LOST ITEMS
 * GET /api/lost/myItems
 */
exports.getMyLostItems = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const items = await LostItem.findByUserId(userId);

        res.json({
            success: true,
            items: items || []
        });

    } catch (error) {
        console.error("Get user lost items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve lost items"
        });
    }
};

/**
 * GET ALL ACTIVE LOST ITEMS
 * GET /api/lost
 */
exports.getAllLostItems = async (req, res) => {
    try {
        const items = await LostItem.findSearching(100);

        res.json({
            success: true,
            items: items || []
        });

    } catch (error) {
        console.error("Get all lost items error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve lost items"
        });
    }
};

/**
 * GET SPECIFIC LOST ITEM
 * GET /api/lost/:id
 */
exports.getLostItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await LostItem.findByIdWithImages(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found"
            });
        }

        res.json({
            success: true,
            item
        });

    } catch (error) {
        console.error("Get lost item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve lost item"
        });
    }
};

/**
 * UPDATE LOST ITEM
 * PUT /api/lost/:id
 */
exports.updateLostItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const item = await LostItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found"
            });
        }

        // Only owner can update
        if (item.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const updatedData = { ...req.body };
        if (req.file) {
            updatedData.image_url = `/uploads/${req.file.filename}`;
        }

        const updated = await LostItem.update(id, updatedData);

        res.json({
            success: true,
            message: "Lost item updated successfully",
            affected: updated,
            image_url: updatedData.image_url
        });

    } catch (error) {
        console.error("Update lost item error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Failed to update lost item"
        });
    }
};

/**
 * DELETE LOST ITEM
 * DELETE /api/lost/:id
 */
exports.deleteLostItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const item = await LostItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found"
            });
        }

        // Only owner can delete
        if (item.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        await LostItem.delete(id);

        res.json({
            success: true,
            message: "Lost item deleted successfully"
        });

    } catch (error) {
        console.error("Delete lost item error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete lost item"
        });
    }
};

/**
 * SEARCH LOST ITEMS
 * GET /api/lost/search?q=keyword
 */
exports.searchLostItems = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        const items = await LostItem.search(q, 20);

        res.json({
            success: true,
            items: items || []
        });

    } catch (error) {
        console.error("Search lost items error:", error);

        res.status(500).json({
            success: false,
            message: "Search failed"
        });
    }
};

/**
 * GET MATCHES FOR LOST ITEM
 * GET /api/lost/:id/matches
 */
exports.getLostItemMatches = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const item = await LostItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found"
            });
        }

        // Only owner can see matches
        if (item.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const matches = await LostItem.findMatches(id);

        res.json({
            success: true,
            matches: matches || []
        });

    } catch (error) {
        console.error("Get matches error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get matches"
        });
    }
};

/**
 * UPDATE LOST ITEM STATUS
 * PATCH /api/lost/:id/status
 */
exports.updateLostItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        const item = await LostItem.findById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found"
            });
        }

        // Only owner can update status
        if (item.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        await LostItem.updateStatus(id, status);

        res.json({
            success: true,
            message: `Lost item status updated to ${status}`
        });

    } catch (error) {
        console.error("Update status error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Failed to update status"
        });
    }
};

/**
 * GET USER STATISTICS
 * GET /api/lost/user/:userId/stats
 */
exports.getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await LostItem.getUserStats(userId);

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error("Get stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get statistics"
        });
    }
};
