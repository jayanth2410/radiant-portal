const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// Create a new task
router.post("/create-task", verifyToken, async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;

    if (!title || !description || !deadline || !assignedTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await User.findById(req.user.id);
    if (!admin || admin.category !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can create tasks." });
    }

    // Validate and convert deadline to a Date object
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: "Invalid deadline format" });
    }

    // Create the task for admin's tasksCreated (includes assignedTo)
    const newTask = {
      title,
      description,
      deadline: deadlineDate,
      assignedTo, // Include assignedTo for admin's tasksCreated
      assignedBy: admin._id,
      status: "pending",
    };

    admin.tasksCreated.push(newTask);
    await admin.save();

    // Get the index of the newly created task
    const taskIndex = admin.tasksCreated.length - 1;

    // Ensure assignedTo contains valid user IDs
    const assignedUsers = await User.find({ _id: { $in: assignedTo } });
    if (assignedUsers.length !== assignedTo.length) {
      return res
        .status(400)
        .json({ message: "One or more assigned users not found" });
    }

    // Create the task for assigned users' tasks (excludes assignedTo)
    const taskForUsers = {
      _id: admin.tasksCreated[taskIndex]._id,
      title,
      description,
      deadline: deadlineDate,
      assignedBy: admin._id,
      status: "pending",
    };

    // Add the task to the assigned users' tasks array
    const updateResult = await User.updateMany(
      { _id: { $in: assignedTo } },
      { $push: { tasks: taskForUsers } }
    );

    console.log("Update Result:", updateResult);

    // Populate the assignedTo field for the newly created task
    await admin.populate(`tasksCreated.${taskIndex}.assignedTo`, "fullName");

    // Get the populated task
    const populatedTask = admin.tasksCreated[taskIndex];

    res.status(201).json({ task: populatedTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Fetch tasks for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("tasksCreated.assignedTo", "fullName") // Populate assignedTo for admin's tasks
      .populate("tasks.assignedBy", "fullName"); // Populate assignedBy for user's tasks

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let tasks = [];
    if (user.category === "admin") {
      tasks = user.tasksCreated; // Admin's created tasks
    } else {
      tasks = user.tasks; // User's assigned tasks
    }

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a task
router.delete("/delete-task/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    const admin = await User.findById(req.user.id);
    if (!admin || admin.category !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can delete tasks." });
    }

    // Remove the task from the admin's tasksCreated array
    const task = admin.tasksCreated.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    admin.tasksCreated.pull({ _id: taskId });
    await admin.save();

    // Remove the task from all assigned users' tasks arrays
    await User.updateMany(
      { "tasks._id": taskId },
      { $pull: { tasks: { _id: taskId } } }
    );

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark a task as completed (for users)
router.put("/mark-completed/:taskId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.category !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }

    const task = user.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "pending") {
      return res.status(400).json({ message: "Task is already completed" });
    }

    const currentDate = new Date("2025-05-14T16:07:00+05:30"); // Current date and time
    const deadline = new Date(task.deadline);
    task.status =
      currentDate > deadline ? "completed after deadline" : "completed";

    // Find the admin who assigned the task and update their tasksCreated
    const admin = await User.findById(task.assignedBy);
    if (admin) {
      const adminTask = admin.tasksCreated.id(req.params.taskId);
      if (adminTask) {
        adminTask.status = task.status;
        await admin.save();
      }
    }

    await user.save();
    res.status(200).json({ message: "Task marked as completed", task });
  } catch (error) {
    console.error("Error marking task as completed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// New route: Undo task completion (for users)
router.put("/undo-complete/:taskId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.category !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }

    const task = user.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "pending") {
      return res.status(400).json({ message: "Task is not completed" });
    }

    task.status = "pending";

    // Find the admin who assigned the task and update their tasksCreated
    const admin = await User.findById(task.assignedBy);
    if (admin) {
      const adminTask = admin.tasksCreated.id(req.params.taskId);
      if (adminTask) {
        adminTask.status = task.status;
        await admin.save();
      }
    }

    await user.save();
    res.status(200).json({ message: "Task completion undone", task });
  } catch (error) {
    console.error("Error undoing task completion:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update-task/:taskId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.category !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const task = user.tasksCreated.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, deadline, assignedTo } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !deadline ||
      !assignedTo ||
      assignedTo.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate assigned users exist
    const assignedUsers = await User.find({ _id: { $in: assignedTo } });
    if (assignedUsers.length !== assignedTo.length) {
      return res
        .status(400)
        .json({ message: "One or more assigned users not found" });
    }

    // Update task details in admin's tasksCreated
    task.title = title;
    task.description = description;
    task.deadline = new Date(deadline).toISOString();
    task.assignedTo = assignedTo;

    // Update the task in all assigned users' tasks array who already have it
    await User.updateMany(
      { _id: { $in: assignedTo }, "tasks._id": req.params.taskId },
      {
        $set: {
          "tasks.$.title": title,
          "tasks.$.description": description,
          "tasks.$.deadline": task.deadline,
          "tasks.$.assignedBy": user._id, // Ensure assignedBy is updated
        },
      }
    );

    // Remove the task from users who are no longer assigned
    await User.updateMany(
      { "tasks._id": req.params.taskId, _id: { $nin: assignedTo } },
      { $pull: { tasks: { _id: req.params.taskId } } }
    );

    // Add the task to newly assigned users who don't have it
    const usersWithTask = await User.find({
      _id: { $in: assignedTo },
      "tasks._id": req.params.taskId,
    }).select("_id");
    const usersWithTaskIds = usersWithTask.map((u) => u._id.toString());
    const usersToAdd = assignedTo.filter(
      (userId) => !usersWithTaskIds.includes(userId)
    );

    console.log("Users to add the task to:", usersToAdd);

    for (const userId of usersToAdd) {
      const newUser = await User.findById(userId);
      if (newUser) {
        newUser.tasks.push({
          _id: req.params.taskId,
          title,
          description,
          deadline: task.deadline,
          status: "pending",
          assignedBy: user._id,
        });
        await newUser.save();
        console.log(`Task added to user ${userId}`);
      }
    }

    await user.save();
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
