const express = require("express");
const router = express.Router();
const { register, login, refresh, logout, getProfile, updateProfile } = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validation");

// Public routes
router.post("/register", validate(schemas.register), register);
router.post("/login", validate(schemas.login), login);
router.post("/refresh", refresh);

// Protected routes
router.use(auth);
router.post("/logout", logout);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
