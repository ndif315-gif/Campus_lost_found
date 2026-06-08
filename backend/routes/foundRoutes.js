const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/foundController");

// ===== CREATE ROUTES =====
router.post("/create", auth, upload.single('photo'), controller.createFoundItem);

// ===== READ ROUTES =====
router.get("/", controller.getAllFoundItems);                          // All active found items
router.get("/search", controller.searchFoundItems);                  // Search found items
router.get("/myItems", auth, controller.getMyFoundItems);              // User's found items
router.get("/:id", controller.getFoundItem);                            // Get specific item

// ===== UPDATE ROUTES =====
router.put("/:id", auth, upload.single('photo'), controller.updateFoundItem);                // Update item
router.patch("/:id/status", auth, controller.updateFoundItemStatus);   // Update status

// ===== DELETE ROUTES =====
router.delete("/:id", auth, controller.deleteFoundItem);              // Delete item

module.exports = router;