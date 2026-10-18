const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");

// Get all registered users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving users",
    });
  }
};

// Block or unblock a user
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent the logged-in admin from blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own account",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User account activated successfully"
        : "User account blocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};

// Get every item, including pending and rejected items
const getAllItemsAdmin = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("owner", "name email studentId faculty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get admin items error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving items",
    });
  }
};

// Approve or reject an item report
const updateItemApproval = async (req, res) => {
  try {
    const { approvalStatus } = req.body;

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!validStatuses.includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Approval status must be pending, approved, or rejected",
      });
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.approvalStatus = approvalStatus;

    await item.save();

    return res.status(200).json({
      success: true,
      message: `Item marked as ${approvalStatus}`,
      item,
    });
  } catch (error) {
    console.error("Update item approval error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating item approval",
    });
  }
};

// Get statistics for the admin dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalItems,
      lostItems,
      foundItems,
      openItems,
      recoveredItems,
      pendingClaims,
      approvedClaims,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      Item.countDocuments(),
      Item.countDocuments({ type: "lost" }),
      Item.countDocuments({ type: "found" }),
      Item.countDocuments({ status: "open" }),
      Item.countDocuments({ status: "recovered" }),
      Claim.countDocuments({ status: "pending" }),
      Claim.countDocuments({ status: "approved" }),
    ]);

    return res.status(200).json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
        },
        items: {
          total: totalItems,
          lost: lostItems,
          found: foundItems,
          open: openItems,
          recovered: recoveredItems,
        },
        claims: {
          pending: pendingClaims,
          approved: approvedClaims,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while retrieving dashboard statistics",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllItemsAdmin,
  updateItemApproval,
  getDashboardStats,
};