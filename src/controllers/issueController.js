const Issue = require("../models/Issue");

const createIssue = async (req, res) => {
    try {
        const { category, description, latitude, longitude, image } = req.body;

        const issue = await Issue.create({
            userId: req.user.id,
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

module.exports = { createIssue };
