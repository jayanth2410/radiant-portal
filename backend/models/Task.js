const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // References users
  deadline: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who created the task
  status: {
    type: String,
    enum: ["pending", "completed", "completed after deadline"],
    default: "pending",
  },
});

module.exports = mongoose.model("Task", taskSchema);