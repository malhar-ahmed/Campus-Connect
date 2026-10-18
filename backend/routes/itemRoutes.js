const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemMatches,
} = require("../controllers/itemController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getItems).post(protect, upload.single("image"), createItem);
router.get("/:id/matches", getItemMatches);  

router
  .route("/:id")
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;