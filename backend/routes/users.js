const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// Fetch all users
router.get("/", verifyToken, async (req, res) => {
  console.log("1st")
  try {
    const users = await User.find(
      {},
      "_id fullName email certifications skills yearsOfExperience category"
    );
    res.status(200).json({ users }); // Wrap the array in an object
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

router.get("/", verifyToken, async (req, res) => {
  console.log("2nd")
  try {
    const users = await User.find({ category: "user" }, "fullName _id");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a user
router.delete("/:userId", verifyToken, async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.category !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can delete users." });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: Prevent deleting admins or self
    if (user.category === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ message: "Cannot delete yourself" });
    }

    // Remove the user from any tasks they are assigned to
    await User.updateMany(
      { "tasksCreated.assignedTo": user._id },
      { $pull: { "tasksCreated.$.assignedTo": user._id } }
    );

    // Remove tasks assigned to this user
    await User.updateMany(
      { "tasks.assignedBy": user._id },
      { $pull: { tasks: { assignedBy: user._id } } }
    );

    // Delete the user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

module.exports = router;
