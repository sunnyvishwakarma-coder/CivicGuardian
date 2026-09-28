const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

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

router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createIssue
);

router.get("/my", authMiddleware, getMyIssues);

router.get("/:id", authMiddleware, getIssueById);

router.patch(
    "/:id/status",
    authMiddleware,
    authorityMiddleware,
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
    upload.fields([
        { name: "beforeImage", maxCount: 1 },
        { name: "afterImage", maxCount: 1 }
    ]),
    submitResolution
);

module.exports = router;
