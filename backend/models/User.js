const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  id: { type: String, unique: true }, // Unique identifier for the user
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "not-set" }, // New role field with a default value

  address: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  }, // Differentiates user/admin
  projects: [{ type: String }], // Array of project names or IDs
  certifications: [{ type: String }], // Array of certification names or IDs
  tasks: {
    completed: [{ type: String }], // Array of completed task IDs or titles
    notCompleted: [{ type: String }], // Array of not completed task IDs or titles
  },
  tasksCreated: [
    {
      title: { type: String },
      description: { type: String },
      assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // References users
      deadline: { type: Date },
      status: {
        type: String,
        enum: ["pending", "completed", "completed after deadline"],
        default: "pending",
      },
    },
  ], // Only applicable for admins
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
