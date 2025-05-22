const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const mongoose = require("mongoose"); // Added to generate ObjectId

router.post("/create-user-task", verifyToken, async (req, res) => {
  const { title, description, deadline } = req.body;
  const userId = req.user.id; // From verifyToken middleware

  // Validate input
  if (!title || !description || !deadline) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the admin user
    const admin = await User.findOne({ category: "admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Validate deadline format
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: "Invalid deadline format" });
    }

    // Create the task object for admin's tasksCreated (includes assignedTo)
    const newTask = {
      _id: new mongoose.Types.ObjectId(), // Generate a unique ID
      title,
      description,
      deadline: deadlineDate,
      assignedTo: [userId], // User is the assignee
      assignedBy: userId,
      status: "in progress",
      completed: false,
    };

    // Add task to admin's tasksCreated array
    admin.tasksCreated.push(newTask);
    await admin.save();

    // Create the task for the user's tasks array (excludes assignedTo)
    const taskForUser = {
      _id: newTask._id, // Use the same ID as admin's task
      title,
      description,
      deadline: deadlineDate,
      assignedBy: userId,
      status: "in progress",
      completed: false,
    };

    // Add task to the user's tasks array
    user.tasks.push(taskForUser);
    await user.save();

    // Populate the assignedTo field for the response
    await admin.populate("tasksCreated.assignedTo", "fullName");
    const populatedTask = admin.tasksCreated.find(
      (task) => task._id.toString() === newTask._id.toString()
    );

    res
      .status(201)
      .json({ message: "Task created successfully", task: populatedTask });
  } catch (error) {
    console.error("Error creating user task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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
    // Define currentDate (03:56 PM IST on May 22, 2025)
    const currentDate = new Date("2025-05-22T15:56:00+05:30");

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
// Update task status (for both users and admins)
router.put("/update-status/:taskId", verifyToken, async (req, res) => {
  try {
    const { status, completed, date } = req.body;
    const { taskId } = req.params;
    const userId = req.user.id; // From verifyToken middleware

    if (!status || completed === undefined || !date) {
      return res
        .status(400)
        .json({ message: "Status, completed, and date fields are required" });
    }

    // Convert date from body to Date object
    const providedDate = new Date(date);

    // Find the current user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the admin
    const admin = await User.findOne({ category: "admin" });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    let task;

    if (user.category === "admin") {
      task = admin.tasksCreated.id(taskId);
      if (!task) {
        return res
          .status(404)
          .json({ message: "Task not found in admin's created tasks" });
      }

      // Compare dates
      if (completed && new Date(task.dueDate) < providedDate) {
        console.log("Task resolved--------- after deadline");
        task.status = "resolved after deadline";
      } else if (task.status === "resolved after deadline") {
        console.log(
          "Task resolved--------- after deadl98689dw79878970897907ine"
        );
        task.status = "completed after deadline";
      } else {
        task.status = status;
      }

      task.completed = completed;

      await admin.save();

      await User.updateMany(
        { "tasks._id": taskId },
        {
          $set: {
            "tasks.$.status": task.status,
            "tasks.$.completed": completed,
          },
        }
      );
    } else {
      task = user.tasks.id(taskId);
      if (!task) {
        return res
          .status(404)
          .json({ message: "Task not found in user's tasks" });
      }

      // Compare dates
      if (completed && new Date(task.deadline) < providedDate) {
        task.status = "resolved after deadline";
      } else {
        task.status = status;
      }

      task.completed = completed;
      await user.save();

      const adminTask = admin.tasksCreated.id(taskId);
      if (adminTask) {
        adminTask.status = task.status;
        adminTask.completed = completed;
        await admin.save();
      } else {
        console.warn(`Task ${taskId} not found in admin's tasksCreated`);
      }
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
