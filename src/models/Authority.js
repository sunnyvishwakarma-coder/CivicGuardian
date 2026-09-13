const mongoose = require("mongoose");

const authoritySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        department: {
            type: String,
            required: true
        },

        role: {
            type: String,
            default: "authority"
        }
    },
    {
        timestamps: true
    }
);

const Authority = mongoose.model("Authority", authoritySchema);

module.exports = Authority;
