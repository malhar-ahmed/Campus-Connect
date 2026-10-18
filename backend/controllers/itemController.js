const Item = require("../models/Item");

// Create a new lost or found item
const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      location,
      incidentDate,
    } = req.body;

    if (!title || !description || !type || !category || !location || !incidentDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : "";

    const item = await Item.create({
      title,
      description,
      type,
      category,
      location,
      incidentDate,
      imageUrl,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Item report created successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create item report",
      error: error.message,
    });
  }
};

// Get all approved items
const getItems = async (req, res) => {
  try {
    const {
      type,
      category,
      location,
      status,
      search,
    } = req.query;

    const filter = {
      approvalStatus: "approved",
    };

    if (type) {
      filter.type = type;
    }

    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const items = await Item.find(filter)
      .populate("owner", "name faculty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving items",
    });
  }
};

// Get one item using its ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    }).populate("owner", "name faculty");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get item error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid item ID",
    });
  }
};

// Update an item
const updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const isOwner =
      item.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this item",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "type",
      "category",
      "location",
      "incidentDate",
      "imageUrl",
      "status",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    item = await Item.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to update item",
    });
  }
};

// Delete an item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const isOwner =
      item.owner.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this item",
      });
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to delete item",
    });
  }
};

const calculateMatchScore = (sourceItem, candidateItem) => {
  let score = 0;

  // Category match
  if (sourceItem.category === candidateItem.category) {
    score += 30;
  }

  // Location similarity
  const sourceLocation = sourceItem.location.toLowerCase();
  const candidateLocation = candidateItem.location.toLowerCase();

  if (
    sourceLocation.includes(candidateLocation) ||
    candidateLocation.includes(sourceLocation)
  ) {
    score += 25;
  }

  // Title keyword similarity
  const sourceWords = sourceItem.title
    .toLowerCase()
    .split(/\s+/);

  const candidateWords = candidateItem.title
    .toLowerCase()
    .split(/\s+/);

  const matchingTitleWords = sourceWords.filter((word) =>
    candidateWords.includes(word)
  );

  score += Math.min(matchingTitleWords.length * 10, 25);

  // Description keyword similarity
  const sourceDescriptionWords = sourceItem.description
    .toLowerCase()
    .split(/\s+/);

  const candidateDescriptionWords = candidateItem.description
    .toLowerCase()
    .split(/\s+/);

  const matchingDescriptionWords =
    sourceDescriptionWords.filter((word) =>
      candidateDescriptionWords.includes(word)
    );

  score += Math.min(
    matchingDescriptionWords.length * 2,
    10
  );

  // Date closeness
  const sourceDate = new Date(sourceItem.incidentDate);
  const candidateDate = new Date(candidateItem.incidentDate);

  const differenceInDays = Math.abs(
    sourceDate - candidateDate
  ) / (1000 * 60 * 60 * 24);

  if (differenceInDays <= 1) {
    score += 10;
  } else if (differenceInDays <= 3) {
    score += 6;
  } else if (differenceInDays <= 7) {
    score += 3;
  }

  return Math.min(score, 100);
};

const getItemMatches = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const oppositeType =
      item.type === "lost" ? "found" : "lost";

    const candidates = await Item.find({
      _id: {
        $ne: item._id,
      },
      type: oppositeType,
      status: "open",
      approvalStatus: "approved",
    }).populate("owner", "name faculty");

    const matches = candidates
      .map((candidate) => {
        const score = calculateMatchScore(item, candidate);

        return {
          matchScore: score,
          item: candidate,
        };
      })
      .filter((match) => match.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      sourceItem: item,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Get item matches error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while finding item matches",
    });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemMatches,
};
