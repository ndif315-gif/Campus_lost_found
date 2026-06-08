const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

router.get("/", auth, controller.getNotifications);
router.patch("/:id/read", auth, controller.markAsRead);
router.post("/read-all", auth, controller.markAllAsRead);

module.exports = router;