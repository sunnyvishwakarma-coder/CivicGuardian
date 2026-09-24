const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        department: {
            type: String,
            required: true
        },

        employeeId: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;
