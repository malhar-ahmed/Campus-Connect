const Claim = require("../models/Claim");
const Item = require("../models/Item");

// Submit a claim for an item
const createClaim = async (req, res) => {
  try {
    const { itemId, message, proofDetails } = req.body;

    if (!itemId || !message || !proofDetails) {
      return res.status(400).json({
        success: false,
        message: "Please provide item, message, and proof details",
      });
    }

    const item = await Item.findOne({
      _id: itemId,
      approvalStatus: "approved",
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (item.status === "recovered" || item.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "This item is no longer accepting claims",
      });
    }

    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot claim your own item report",
      });
    }

    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a claim for this item",
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message,
      proofDetails,
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate("item", "title type category location status")
      .populate(
        "claimant",
        "name email studentId faculty"
      );

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully",
      claim: populatedClaim,
    });
  } catch (error) {
    console.error("Create claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting claim",
    });
  }
};

// View claims submitted by the logged-in user
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      claimant: req.user._id,
    })
      .populate(
        "item",
        "title type category location status imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get my claims error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving claims",
    });
  }
};

// View claims received for items created by the logged-in user
const getReceivedClaims = async (req, res) => {
  try {
    const userItems = await Item.find({
      owner: req.user._id,
    }).select("_id");

    const itemIds = userItems.map((item) => item._id);

    const claims = await Claim.find({
      item: {
        $in: itemIds,
      },
    })
      .populate(
        "item",
        "title type category location status"
      )
      .populate(
        "claimant",
        "name email studentId faculty"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get received claims error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving received claims",
    });
  }
};

// Approve or reject a claim
const reviewClaim = async (req, res) => {
  try {
    const { status, reviewMessage } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const claim = await Claim.findById(req.params.id)
      .populate("item");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (!claim.item || claim.item.approvalStatus !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Item not found or unavailable for claim review",
      });
    }

    const isItemOwner =
      claim.item.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isItemOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this claim",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This claim has already been reviewed",
      });
    }

    claim.status = status;
    claim.reviewMessage = reviewMessage || "";
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();

    await claim.save();

    if (status === "approved") {
      claim.item.status = "recovered";
      await claim.item.save();

      await Claim.updateMany(
        {
          item: claim.item._id,
          _id: {
            $ne: claim._id,
          },
          status: "pending",
        },
        {
          status: "rejected",
          reviewMessage:
            "Another claim for this item was approved",
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        }
      );
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate("item", "title type category location status")
      .populate(
        "claimant",
        "name email studentId faculty"
      )
      .populate("reviewedBy", "name role");

    return res.status(200).json({
      success: true,
      message: `Claim ${status} successfully`,
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Review claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while reviewing claim",
    });
  }
};

// Cancel a pending claim
const cancelClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    if (
      claim.claimant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this claim",
      });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending claims can be cancelled",
      });
    }

    claim.status = "cancelled";
    await claim.save();

    return res.status(200).json({
      success: true,
      message: "Claim cancelled successfully",
      claim,
    });
  } catch (error) {
    console.error("Cancel claim error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling claim",
    });
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
  cancelClaim,
};
