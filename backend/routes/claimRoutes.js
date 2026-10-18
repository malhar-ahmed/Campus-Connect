const express = require("express");

const {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
  cancelClaim,
} = require("../controllers/claimController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createClaim);

router.get("/mine", protect, getMyClaims);

router.get(
  "/received",
  protect,
  getReceivedClaims
);

router.put(
  "/:id/review",
  protect,
  reviewClaim
);

router.put(
  "/:id/cancel",
  protect,
  cancelClaim
);

module.exports = router;