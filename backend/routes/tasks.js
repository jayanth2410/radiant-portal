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
      status: "in progress", // Set default status
      completed: false, // Initialize completed as false
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
      status: "in progress", // Set default status
      completed: false, // Initialize completed as false
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
    // Define currentDate (01:06 PM IST on May 16, 2025)
    const currentDate = new Date("2025-05-16T13:06:00+05:30");

    const user = await User.findById(req.user.id)
      .populate("tasksCreated.assignedTo", "fullName")
      .populate("tasks.assignedBy", "fullName");

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

    const task = admin.tasksCreated.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    admin.tasksCreated.pull({ _id: taskId });
    await admin.save();

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

// Update task status (for both users and admins)
router.put("/update-status/:taskId", verifyToken, async (req, res) => {
  try {
    const { status, completed } = req.body;

    if (!status || completed === undefined) {
      return res
        .status(400)
        .json({ message: "Status and completed fields are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let task;
    let admin;

    if (user.category === "admin") {
      // Admin updating their tasksCreated
      task = user.tasksCreated.id(req.params.taskId);
      if (!task) {
        return res
          .status(404)
          .json({ message: "Task not found in admin's created tasks" });
      }

      // Update the admin's task
      task.status = status;
      task.completed = completed;

      // Find all users assigned to this task and update their tasks array
      await User.updateMany(
        { "tasks._id": req.params.taskId },
        {
          $set: {
            "tasks.$.status": status,
            "tasks.$.completed": completed,
          },
        }
      );

      await user.save();
    } else {
      // User updating their assigned tasks
      task = user.tasks.id(req.params.taskId);
      if (!task) {
        return res
          .status(404)
          .json({ message: "Task not found in user's tasks" });
      }

      // Update the user's task
      task.status = status;
      task.completed = completed;

      // Find the admin who assigned the task and update their tasksCreated
      admin = await User.findById(task.assignedBy);
      if (admin) {
        const adminTask = admin.tasksCreated.id(req.params.taskId);
        if (adminTask) {
          adminTask.status = status;
          adminTask.completed = completed;
          await admin.save();
        }
      }

      await user.save();
    }

    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a task
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

    if (
      !title ||
      !description ||
      !deadline ||
      !assignedTo ||
      assignedTo.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
    task.status = "in progress"; // Reset status to "in progress" on update
    task.completed = false; // Reset completed to false on update

    // Update the task in all assigned users' tasks array who already have it
    await User.updateMany(
      { _id: { $in: assignedTo }, "tasks._id": req.params.taskId },
      {
        $set: {
          "tasks.$.title": title,
          "tasks.$.description": description,
          "tasks.$.deadline": task.deadline,
          "tasks.$.assignedBy": user._id,
          "tasks.$.status": "in progress", // Reset status
          "tasks.$.completed": false, // Reset completed
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
          assignedBy: user._id,
          status: "in progress", // Set default status
          completed: false, // Initialize completed as false
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
