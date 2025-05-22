const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  profilePicture: {
    type: Buffer,
    default: null,
  },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  id: { type: String, default: "not-set" },
  dateOfBirth: { type: Date, default: null },
  phone: { type: String, default: "not-set" },
  role: { type: String, default: "not-set" },
  address: { type: String, default: "not-set" },
  yearsOfExperience: { type: Number, default: 0 },
  category: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  projects: {
    type: [
      {
        title: { type: String, required: true },
        myRole: { type: String, required: true },
        description: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        techUsed: { type: [String], default: [] },
      },
    ],
    default: [],
  },
  certifications: {
    type: [
      {
        title: { type: String, required: true },
        duration: { type: String, required: true },
        skillsObtained: { type: [String], default: [] },
        certificateImage: { type: Buffer, default: null },
      },
    ],
    default: [],
  },
  skills: { type: [String], default: [] },
  bloodGroup: { type: String, default: "not-set" },
  emergencyContact: { type: String, default: "not-set" },
  personalEmail: { type: String, default: "not-set" },
  tasksCreated: {
    type: [
      {
        title: { type: String, default: "not-set" },
        description: { type: String, default: "not-set" },
        deadline: { type: Date, default: null },
        assignedTo: [
          { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
        ],
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: ["in progress", "testing", "resolved", "completed", "completed after deadline", "resolved after deadline"],
          default: "in progress",
        },
      },
    ],
    default: [],
  },
  tasks: {
    type: [
      {
        title: { type: String, default: "not-set" },
        description: { type: String, default: "not-set" },
        deadline: { type: Date, default: null },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: ["in progress", "testing", "resolved", "completed", "completed after deadline", "resolved after deadline"],
          default: "in progress",
        },
      },
    ],
    default: [],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
