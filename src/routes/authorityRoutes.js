const express = require("express");

const router = express.Router();

const {
    registerAuthority,
    authorityLogin,
  createWorker,
    getWorkers
} = require("../controllers/authorityController");

const authorityMiddleware = require("../middleware/authorityMiddleware");

router.post("/register", registerAuthority);

router.post("/login", authorityLogin);

router.get(
    "/workers",
    authorityMiddleware,
    getWorkers
);

router.post(
    "/workers",
    authorityMiddleware,
    createWorker
);

module.exports = router;
