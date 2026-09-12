const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        category: {
            type: String,
            enum: [
                "water_leakage",
                "garbage",
                "road_damage",
                "drainage",
                "streetlight",
                "other"
            ],
            required: true
        },

        description: {
            type: String,
            required: true
        },

        image: {
            url: String
        },

        location: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        },

        status: {
            type: String,
            enum: [
                "SUBMITTED",
                "AI_VERIFIED",
                "UNDER_REVIEW",
                "RESOLVED",
                "REOPENED"
            ],
            default: "SUBMITTED"
        },

        aiVerification: {
            relevant: Boolean,
            detectedCategory: String,
            confidence: Number
        }
    },
    {
        timestamps: true
    }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
