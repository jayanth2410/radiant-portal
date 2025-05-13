// Fetch tasks from the backend
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// Create a new task
router.post("/create-task", verifyToken, async (req, res) => {
  const { title, description, deadline, assignedTo } = req.body;

  try {
    // Find the admin who is creating the task
    const admin = await User.findById(req.user.id);
    if (!admin || admin.category !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can create tasks." });
    }

    // Create the task object
    const task = {
      title,
      description,
      deadline,
      assignedTo: [assignedTo],
      status: "pending",
    };

    // Save the task in the admin's tasksCreated array
    admin.tasksCreated.push(task);
    await admin.save();

    // Save the task in the assigned user's tasks.notCompleted array
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found." });
    }

    assignedUser.tasks.notCompleted.push(task);
    await assignedUser.save();

    res.status(201).json({ message: "Task created successfully!", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all users
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     // Fetch all users with the required fields
//     const users = await User.find(
//       {},
//       "fullName email certifications skills experience"
//     );
//     res.status(200).json(users);
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ message: "Failed to fetch users." });
//   }
// });

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let tasks = [];
    if (user.category === "admin") {
      tasks = user.tasksCreated; // Admin's created tasks
    } else {
      tasks = user.tasks.notCompleted; // User's assigned tasks
    }

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
