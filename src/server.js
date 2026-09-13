require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

// Home route
app.get("/", (req, res) => {
    res.send("CivicGuardian Backend is Running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
