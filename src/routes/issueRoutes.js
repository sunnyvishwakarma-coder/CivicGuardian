const express = require("express");
const router = express.Router();

const {
  createIssue,
  getAllIssues,
  getMyIssues
} = require("../controllers/issueController");

const authMiddleware = require("../middleware/authMiddleware");
const authorityMiddleware = require("../middleware/authorityMiddleware");

router.post("/", authMiddleware, createIssue);

router.get("/my", authMiddleware, getMyIssues);

router.get(
    "/",
    authMiddleware,
    authorityMiddleware,
    getAllIssues
);

module.exports = router;
