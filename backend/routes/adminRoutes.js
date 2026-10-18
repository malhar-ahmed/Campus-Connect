const express = require("express");

const {
  getAllUsers,
  updateUserStatus,
  getAllItemsAdmin,
  updateItemApproval,
  getDashboardStats,
} = require("../controllers/adminController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  adminOnly,
} = require("../middleware/adminMiddleware");

const router = express.Router();

// Every route below requires login and admin role
router.use(protect);
router.use(adminOnly);

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);

router.put(
  "/users/:id/status",
  updateUserStatus
);

router.get("/items", getAllItemsAdmin);

router.put(
  "/items/:id/approval",
  updateItemApproval
);

module.exports = router;