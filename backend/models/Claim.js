const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: [true, "Claim message is required"],
      trim: true,
      minlength: [
        10,
        "Claim message must contain at least 10 characters",
      ],
      maxlength: [
        1000,
        "Claim message cannot exceed 1000 characters",
      ],
    },

    proofDetails: {
      type: String,
      required: [true, "Proof details are required"],
      trim: true,
      minlength: [
        5,
        "Proof details must contain at least 5 characters",
      ],
      maxlength: [
        1000,
        "Proof details cannot exceed 1000 characters",
      ],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewMessage: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Review message cannot exceed 500 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index(
  {
    item: 1,
    claimant: 1,
  },
  {
    unique: true,
  }
);

const Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;