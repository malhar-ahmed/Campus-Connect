const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must contain at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    type: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Item type is required"],
    },

    category: {
      type: String,
      enum: [
        "Electronics",
        "Documents",
        "Bags",
        "Clothing",
        "Keys",
        "Books",
        "Accessories",
        "Other",
      ],
      required: [true, "Category is required"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    incidentDate: {
      type: Date,
      required: [true, "Lost or found date is required"],
    },

    imageUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["open", "claimed", "recovered", "closed"],
      default: "open",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;