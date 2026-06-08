/**
 * LOST ITEMS ROUTES
 * All routes require authentication
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/lostController");

// ===== CREATE ROUTES =====
router.post("/create", auth, upload.single('photo'), controller.createLostItem);

// ===== READ ROUTES =====
router.get("/", controller.getAllLostItems);                        // All active lost items
router.get("/myItems", auth, controller.getMyLostItems);            // User's lost items
router.get("/search", controller.searchLostItems);                  // Search lost items
router.get("/:id", controller.getLostItem);                          // Get specific item
router.get("/:id/matches", auth, controller.getLostItemMatches);    // Get matches for item

// ===== UPDATE ROUTES =====
router.put("/:id", auth, upload.single('photo'), controller.updateLostItem);                // Update item
router.patch("/:id/status", auth, controller.updateLostItemStatus); // Update status

// ===== DELETE ROUTES =====
router.delete("/:id", auth, controller.deleteLostItem);            // Delete item

// ===== STATS ROUTES =====
router.get("/user/:userId/stats", controller.getUserStats);        // User statistics

module.exports = router;
