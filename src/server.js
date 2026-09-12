require("dotenv").config();
const issueRoutes = require("./routes/issueRoutes");
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

const PORT = 5000;

// Middleware
app.use(express.json());

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("CivicGuardian Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
