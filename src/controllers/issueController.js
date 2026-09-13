const Issue = require("../models/Issue");

const createIssue = async (req, res) => {
    try {
        const { category, description, latitude, longitude, image } = req.body;

        const issue = await Issue.create({
            userId: req.user.userId,
            category,
            description,
            location: {
                latitude,
                longitude
            },
            image: {
                url: image
            }
        });

        res.status(201).json({
            message: "Issue reported successfully",
            issue
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create issue",
            error: error.message
        });
    }
};

const getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "All issues fetched successfully",
            count: issues.length,
            issues: issues
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch issues",
            error: error.message
        });
    }
};

const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: issues.length,
            issues
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your issues",
            error: error.message
        });
    }
};


module.exports = {
    createIssue,
  getAllIssues,
  getMyIssues
};
