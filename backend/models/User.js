const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); 

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  id: { type: String, unique: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "not-set" },
  address: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  projects: [{ type: String }],
  certifications: [{ type: String }],
  skills: [{ type: String }], // Added skills field
  // ... other fields
  tasksCreated: [
    {
      title: { type: String },
      description: { type: String },
      deadline: { type: Date },
      assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "completed", "completed after deadline"],
        default: "pending",
      },
    },
  ],
  tasks: [
    {
      title: { type: String },
      description: { type: String },
      deadline: { type: Date },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "completed", "completed after deadline"],
        default: "pending",
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
