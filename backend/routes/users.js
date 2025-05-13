const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// Fetch all users
router.get("/", verifyToken, async (req, res) => {
  try {
    // Fetch all users with the required fields
    const users = await User.find(
      {},
      "fullName email certifications skills yearsOfExperience"
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

module.exports = router;
