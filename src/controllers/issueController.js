const Issue = require("../models/Issue");
const Worker = require("../models/Worker");
const Authority = require("../models/Authority");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const allowedTransitions = {
  SUBMITTED: ["UNDER_REVIEW"],

  UNDER_REVIEW: [],

  ASSIGNED: ["IN_PROGRESS"],

  IN_PROGRESS: ["RESOLUTION_SUBMITTED"],

  RESOLUTION_SUBMITTED: ["CITIZEN_VERIFICATION"],

  CITIZEN_VERIFICATION: ["RESOLVED", "REOPENED"],

  REOPENED: ["IN_PROGRESS"],

  RESOLVED: [],
};

const createIssue = async (req, res) => {
  try {
    const { category, description, latitude, longitude, address } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        message: "Category and description are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Issue image is required",
      });
    }
    // Upload image buffer to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    const issue = await Issue.create({
      userId: req.user.userId,

      category,

      description,

      image: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      },

      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address,
      },

      status: "SUBMITTED",

      statusHistory: [
        {
          status: "SUBMITTED",
          changedBy: req.user.userId,
          changedByModel: "User",
          note: "Issue submitted by citizen",
        },
      ],
    });

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create issue",
      error: error.message,
    });
  }
};

const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your issues",
      error: error.message,
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    res.status(200).json({
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch issue",
      error: error.message,
    });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("userId", "name email")
      .populate("assignedTo", "name phone department employeeId")
      .populate("assignedBy", "name email department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const authorityStatuses = [
      "UNDER_REVIEW",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLUTION_SUBMITTED",
      "CITIZEN_VERIFICATION",
    ];

    if (!authorityStatuses.includes(status)) {
      return res.status(400).json({
        message: "Authority cannot set this status",
      });
    }

    // Get current status
    const currentStatus = issue.status;

    // Get allowed next statuses
    const nextStatuses = allowedTransitions[currentStatus];

    // Check status transition
    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    issue.status = status;

    issue.statusHistory.push({
      status: status,
      changedBy: req.user.id,
      changedByModel: "Authority",
      note: note || "",
    });

    await issue.save();

    res.status(200).json({
      message: "Issue status updated successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update issue status",
      error: error.message,
    });
  }
};

const assignIssue = async (req, res) => {
  try {
    const { workerId } = req.body;

    // 1. Check workerId
    if (!workerId) {
      return res.status(400).json({
        message: "workerId is required",
      });
    }

    // 2. Find issue
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    if (issue.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        message: "Worker can only be assigned when issue is under review",
      });
    }
    // 3. Find worker
    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    // 4. Find logged-in authority
    const authority = await Authority.findById(req.user.id);

    if (!authority) {
      return res.status(403).json({
        message: "Authority not found",
      });
    }

    // 5. Assign worker
    issue.assignedTo = worker._id;

    // 6. Store which authority assigned it
    issue.assignedBy = authority._id;
    issue.status = "ASSIGNED";

    issue.statusHistory.push({
      status: "ASSIGNED",
      changedBy: req.user.id,
      changedByModel: "Authority",
      note: `Issue assigned to worker ${worker.name}`,
    });
    // 7. Save
    await issue.save();

    res.status(200).json({
      message: "Issue assigned successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign issue",
      error: error.message,
    });
  }
};

const resolveIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    // Make sure this issue belongs to the logged-in citizen
    if (issue.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only resolve your own issue",
      });
    }

    // Issue must be waiting for citizen verification
    if (issue.status !== "CITIZEN_VERIFICATION") {
      return res.status(400).json({
        message: "Issue is not ready for citizen verification",
      });
    }

    issue.status = "RESOLVED";

    issue.statusHistory.push({
      status: "RESOLVED",
      changedBy: req.user.userId,
      changedByModel: "User",
      note: "Citizen confirmed that the issue was resolved",
    });

    await issue.save();

    res.status(200).json({
      message: "Issue resolved successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to resolve issue",
      error: error.message,
    });
  }
};

const reopenIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    // Make sure this issue belongs to the logged-in citizen
    if (issue.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only reopen your own issue",
      });
    }

    // Citizen can reopen only during verification
    if (issue.status !== "CITIZEN_VERIFICATION") {
      return res.status(400).json({
        message: "Issue cannot be reopened at this stage",
      });
    }

    issue.status = "REOPENED";

    issue.statusHistory.push({
      status: "REOPENED",
      changedBy: req.user.userId,
      changedByModel: "User",
      note: "Citizen reported that the issue was not properly resolved",
    });

    await issue.save();

    res.status(200).json({
      message: "Issue reopened successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reopen issue",
      error: error.message,
    });
  }
};

const submitResolution = async (req, res) => {
    try {
        const {
            description,
            completionDate
        } = req.body;

        if (!description || !completionDate) {
            return res.status(400).json({
                message: "Description and completion date are required"
            });
        }

        if (
            !req.files ||
            !req.files.beforeImage ||
            !req.files.afterImage
        ) {
            return res.status(400).json({
                message: "Before and after images are required"
            });
        }

        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).json({
                message: "Issue not found"
            });
        }

        if (issue.status !== "IN_PROGRESS") {
            return res.status(400).json({
                message:
                    "Resolution can only be submitted when issue is IN_PROGRESS"
            });
        }

        if (!issue.assignedTo) {
            return res.status(400).json({
                message: "Issue has not been assigned to a worker"
            });
        }

        const beforeFile = req.files.beforeImage[0];
        const afterFile = req.files.afterImage[0];

        // Upload both images to Cloudinary
        const beforeCloudinary =
            await uploadToCloudinary(beforeFile.buffer);

        const afterCloudinary =
            await uploadToCloudinary(afterFile.buffer);

        issue.resolution = {
            description,

            completionDate,

            beforeImage: {
                url: beforeCloudinary.secure_url,
                publicId: beforeCloudinary.public_id
            },

            afterImage: {
                url: afterCloudinary.secure_url,
                publicId: afterCloudinary.public_id
            },

            submittedAt: new Date()
        };

        issue.status = "RESOLUTION_SUBMITTED";

        issue.statusHistory.push({
            status: "RESOLUTION_SUBMITTED",
            changedBy: req.user.id,
            changedByModel: "Authority",
            note: "Resolution submitted with before and after images"
        });

        await issue.save();

        res.status(200).json({
            message: "Resolution submitted successfully",
            issue
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to submit resolution",
            error: error.message
        });
    }
};

module.exports = {
  createIssue,
  getMyIssues,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  assignIssue,
  resolveIssue,
  reopenIssue,
  submitResolution,
};
