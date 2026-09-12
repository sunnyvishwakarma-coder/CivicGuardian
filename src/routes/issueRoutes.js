const express = require("express");

const { createIssue } = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createIssue);

module.exports = router;
