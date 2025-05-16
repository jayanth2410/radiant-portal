const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  profilePicture: {
    type: Buffer,
    default: null,
  },
  fullName: { type: String, required: true }, // No default, provided in signup
  email: { type: String, required: true, unique: true }, // No default, provided in signup
  password: { type: String, required: true }, // No default, provided in signup
  id: { type: String, default: "not-set" }, // Non-unique, default "not-set"
  dateOfBirth: { type: Date, default: null }, // Optional, default null
  phone: { type: String, default: "not-set" }, // Optional, default "not-set"
  role: { type: String, default: "not-set" }, // Already has default "not-set"
  address: { type: String, default: "not-set" }, // Optional, default "not-set"
  yearsOfExperience: { type: Number, default: 0 }, // Optional, default 0
  category: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  }, // Already has default "user"
  projects: { type: [String], default: [] }, // Default empty array
  certifications: { type: [String], default: [] }, // Default empty array
  skills: { type: [String], default: [] }, // Default empty array
  bloodGroup: { type: String, default: "not-set" }, // Optional, default "not-set"
  emergencyContact: { type: String, default: "not-set" }, // Optional, default "not-set"
  personalEmail: { type: String, default: "not-set" }, // Optional, default "not-set"
  tasksCreated: {
    type: [
      {
        title: { type: String, default: "not-set" },
        description: { type: String, default: "not-set" },
        deadline: { type: Date, default: null },
        assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        status: {
          type: String,
          enum: ["pending", "completed", "completed after deadline"],
          default: "pending",
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
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        status: {
          type: String,
          enum: ["pending", "completed", "completed after deadline"],
          default: "pending",
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