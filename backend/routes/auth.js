const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const jwtSecret = "myHardcodedSecretKey"; // Replace with your secret key
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Validate required fields
    if (!fullName || !email || !password) {
      console.log("[DEBUG] Missing required fields:", {
        fullName,
        email,
        password,
      });
      return res
        .status(400)
        .json({ message: "Full name, email, and password are required" });
    }
    console.log("check 1");
    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[DEBUG] Email already in use:", email);
      return res.status(400).json({ message: "Email already in use" });
    }
    console.log("check 2");
    // Create new user
    const user = new User({
      fullName,
      email,
      password: password,
      category: "user", // Default to "user"
    });
    console.log("check 3: ", user);
    await user.save();
    console.log("[DEBUG] User created:", { id: user._id, fullName, email });
    console.log("check 4");
    // Generate JWT token (example)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || jwtSecret,
      {
        expiresIn: "1h",
      }
    );
    console.log("check 5+ token: ", token);
    res.status(201).json({ message: "User created successfully!", token });
  } catch (error) {
    console.error("[ERROR] Signup error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log("User found by /login endpoint:", user); // Debugging log
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: user.toObject(),
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Fetch User Data Route
router.get("/me", verifyToken, async (req, res) => {
  try {
    console.log("[DEBUG] Fetching user data for ID:", req.user.id);
    const user = await User.findById(req.user.id)
      .select("-password") // Exclude password
      .populate("tasksCreated.assignedTo", "fullName")
      .populate("tasks.assignedBy", "fullName");
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toObject();
    if (user.profilePicture && Buffer.isBuffer(user.profilePicture)) {
      console.log("[DEBUG] Converting profilePicture Buffer to base64");
      userData.profilePicture = `data:image/jpeg;base64,${user.profilePicture.toString(
        "base64"
      )}`;
    } else {
      console.log("[DEBUG] No profilePicture for user:", user._id);
      userData.profilePicture = null;
    }

    console.log("[DEBUG] Sending user data:", {
      id: userData.id,
      fullName: userData.fullName,
      profilePicture: userData.profilePicture ? "base64 string" : "null",
    });
    res.status(200).json(userData);
  } catch (err) {
    console.error("[ERROR] Fetching user data:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user data (for both admins and users)
// router.get("/m", verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id)
//       .select("-password")
//       .populate("tasksCreated.assignedTo", "fullName")
//       .populate("tasks.assignedBy", "fullName");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Promote User to Admin Route
router.put("/promote-to-admin/:userId", verifyToken, async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);
    if (!requester || requester.category !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can promote users." });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.category = "admin";
    await user.save();

    res.status(200).json({ message: "User promoted to admin successfully!" });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile Route

const multer = require("multer");

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.put(
  "/update-profile",
  verifyToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      console.log("[DEBUG] Update profile request for user ID:", req.user.id);
      const user = await User.findById(req.user.id);
      if (!user) {
        console.log("[DEBUG] User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      // Handle profile picture
      if (req.file) {
        console.log("[DEBUG] Profile picture uploaded:", {
          size: req.file.size,
          mimetype: req.file.mimetype,
        });
        user.profilePicture = req.file.buffer;
      }

      // Update fields
      const updates = req.body;
      console.log("[DEBUG] Update fields received:", updates);

      user.fullName = updates.fullName;
      user.dateOfBirth = new Date(updates.dateOfBirth);
      user.phone = updates.phone;
      user.address = updates.address;
      user.yearsOfExperience = updates.yearsOfExperience;
      user.role = updates.role;
      user.bloodGroup = updates.bloodGroup;

      user.emergencyContact = updates.emergencyContact;
      user.personalEmail = updates.personalEmail;
      user.id = updates.id;

      await user.save();
      console.log("[DEBUG] User updated successfully:", {
        id: user._id,
        fullName: user.fullName,
        hasProfilePicture: !!user.profilePicture,
      });

      // Prepare response
      const updatedUser = user.toObject();
      if (user.profilePicture) {
        console.log(
          "[DEBUG] Converting profilePicture Buffer to base64 for response"
        );
        updatedUser.profilePicture = `data:image/jpeg;base64,${user.profilePicture.toString(
          "base64"
        )}`;
      }

      res.json(updatedUser);
    } catch (err) {
      console.error("[ERROR] Updating profile:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Fetch all users
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "fullName _id");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Get admin user data
router.get("/admin", verifyToken, async (req, res) => {
  try {
    // req.user is set by the verifyToken middleware
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.category !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
