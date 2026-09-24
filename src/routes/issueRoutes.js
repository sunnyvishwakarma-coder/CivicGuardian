const express = require("express");
const router = express.Router();

const {
    createIssue,
    getMyIssues,
    getAllIssues,
    getIssueById,
  updateIssueStatus,
  assignIssue,
  resolveIssue,
  reopenIssue,
    submitResolution
} = require("../controllers/issueController");

const authMiddleware = require("../middleware/authMiddleware");
const authorityMiddleware = require("../middleware/authorityMiddleware");

router.post("/", authMiddleware, createIssue);

router.get("/my", authMiddleware, getMyIssues);

router.get("/:id", authMiddleware, getIssueById);

router.patch(
    "/:id/status",
    authMiddleware,
    updateIssueStatus
);

router.patch(
    "/:id/assign",
    authMiddleware,
    authorityMiddleware,
    assignIssue
);
router.get(
    "/",
    authMiddleware,
    authorityMiddleware,
    getAllIssues
);

router.patch(
    "/:id/resolve",
    authMiddleware,
    resolveIssue
);

router.patch(
    "/:id/reopen",
    authMiddleware,
    reopenIssue
);

router.patch(
    "/:id/resolution",
    authorityMiddleware,
    submitResolution
);

module.exports = router;
