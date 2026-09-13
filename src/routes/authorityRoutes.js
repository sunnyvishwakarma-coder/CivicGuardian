const express = require("express");

const router = express.Router();

const {
    createAuthority,
    authorityLogin
} = require("../controllers/authorityController");

router.post("/create", createAuthority);

router.post("/login", authorityLogin);

module.exports = router;
