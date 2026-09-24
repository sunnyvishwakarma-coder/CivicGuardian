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
              "UNDER_REVIEW",
              "ASSIGNED",
              "IN_PROGRESS",
              "RESOLUTION_SUBMITTED",
              "CITIZEN_VERIFICATION",
              "RESOLVED",
              "REOPENED"
            ],
            default: "SUBMITTED"
        },

        aiVerification: {
            relevant: Boolean,
            detectedCategory: String,
            confidence: Number
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Worker",
            default: null
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authority",
            default: null
        },

        resolution: {
            description: {
                type: String,
                default: ""
            },

            completionDate: {
                type: Date,
                default: null
            },

            beforeImage: {
                type: String,
                default: ""
            },

            afterImage: {
                type: String,
                default: ""
            },

            submittedAt: {
                type: Date,
                default: null
            }
    },

        statusHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        "SUBMITTED",
                        "UNDER_REVIEW",
                        "ASSIGNED",
                        "IN_PROGRESS",
                        "RESOLUTION_SUBMITTED",
                        "CITIZEN_VERIFICATION",
                        "RESOLVED",
                        "REOPENED"
                    ],
                    required: true
                },

                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    refPath: "statusHistory.changedByModel"
                },

                changedByModel: {
                    type: String,
                    enum: ["User", "Authority"],
                    required: true
                },

                note: {
                    type: String,
                    default: ""
                },

                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
  },
    {
        timestamps: true
    }
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
