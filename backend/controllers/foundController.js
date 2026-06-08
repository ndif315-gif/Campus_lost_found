const FoundItem = require("../models/FoundItem");

/**
 * CREATE FOUND ITEM
 * POST /api/found/create
 */
exports.createFoundItem = async (req, res) => {
    try {
        const {
            category,
            item_name,
            brand,
            color,
            description,
            found_location
        } = req.body;

        const userId = req.user?.id;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Create found item
        const itemId = await FoundItem.create({
            user_id: userId,
            category,
            item_name,
            brand: brand || null,
            color,
            description,
            found_location,
            image_url: imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Found item reported successfully",
            itemId,
            image_url: imageUrl
        });

    } catch (error) {
        console.error("Create found item error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to create found item"
        });
    }
};

/**
 * GET ALL ACTIVE FOUND ITEMS
 */
exports.getAllFoundItems = async (req, res) => {
    try {
        const items = await FoundItem.findAvailable(100);
        res.json({
            success: true,
            items: items || []
        });
    } catch (error) {
        console.error("Get all found items error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve items"
        });
    }
};

/**
 * SEARCH FOUND ITEMS
 * GET /api/found/search?q=keyword
 */
exports.searchFoundItems = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        const items = await FoundItem.search(q, 20);

        res.json({
            success: true,
            items: items || []
        });
    } catch (error) {
        console.error("Search found items error:", error);
        res.status(500).json({
            success: false,
            message: "Search failed"
        });
    }
};

/**
 * GET USER'S FOUND ITEMS
 */
exports.getMyFoundItems = async (req, res) => {
    try {
        const userId = req.user?.id;
        const items = await FoundItem.findByUserId(userId);
        res.json({
            success: true,
            items: items || []
        });
    } catch (error) {
        console.error("Get my found items error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve items"
        });
    }
};

/**
 * GET SPECIFIC FOUND ITEM
 */
exports.getFoundItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await FoundItem.findByIdWithImages(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.json({
            success: true,
            item
        });
    } catch (error) {
        console.error("Get found item error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve item"
        });
    }
};

/**
 * UPDATE FOUND ITEM
 */
exports.updateFoundItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const item = await FoundItem.findById(id);
        if (!item || item.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const updatedData = { ...req.body };
        if (req.file) {
            updatedData.image_url = `/uploads/${req.file.filename}`;
        }

        await FoundItem.update(id, updatedData);

        res.json({
            success: true,
            message: "Found item updated successfully",
            image_url: updatedData.image_url
        });
    } catch (error) {
        console.error("Update found item error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update item"
        });
    }
};

/**
 * DELETE FOUND ITEM
 */
exports.deleteFoundItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const item = await FoundItem.findById(id);
        if (!item || item.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await FoundItem.delete(id);
        res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
        console.error("Delete found item error:", error);
        res.status(500).json({ success: false, message: "Failed to delete item" });
    }
};

/**
 * UPDATE FOUND ITEM STATUS
 */
exports.updateFoundItemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        const item = await FoundItem.findById(id);
        if (!item || item.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await FoundItem.update(id, { status });
        res.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to update status" });
    }
};