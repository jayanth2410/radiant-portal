const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only .jpg, .png, and .jpeg files are allowed!"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("certificationImage");

// Create a new certification
router.post("/create-certification", verifyToken, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title, duration, skills } = req.body;

      if (!title || !duration) {
        return res
          .status(400)
          .json({ message: "Title and duration are required" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let skillsArray = [];
      if (skills) {
        if (Array.isArray(skills)) {
          skillsArray = skills;
        } else if (typeof skills === "string") {
          skillsArray = skills.split(",").map((skill) => skill.trim());
        }
      }

      const newCertification = {
        title,
        duration,
        certificationImage: req.file
          ? `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`
          : null,
        skills: skillsArray,
      };

      user.certifications.push(newCertification);
      await user.save();

      const addedCertification =
        user.certifications[user.certifications.length - 1];

      res.status(201).json({ certification: addedCertification });
    } catch (error) {
      console.error("Error creating certification:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
});

// Update an existing certification
router.put("/update-certification/:certificationId", verifyToken, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { certificationId } = req.params;
      const { title, duration, skills } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const certification = user.certifications.id(certificationId);
      if (!certification) {
        return res.status(404).json({ message: "Certification not found" });
      }

      // Update fields if provided
      if (title) certification.title = title;
      if (duration) certification.duration = duration;
      if (req.file) {
        certification.certificationImage = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;
      }

      // Handle skills
      if (skills) {
        let skillsArray = [];
        if (Array.isArray(skills)) {
          skillsArray = skills;
        } else if (typeof skills === "string") {
          skillsArray = skills.split(",").map((skill) => skill.trim());
        }
        certification.skills = skillsArray;
      }

      await user.save();

      res.status(200).json({ certification });
    } catch (error) {
      console.error("Error updating certification:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
});

// Delete a certification
router.delete(
  "/delete-certification/:certificationId",
  verifyToken,
  async (req, res) => {
    try {
      const { certificationId } = req.params;

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const certification = user.certifications.id(certificationId);
      if (!certification) {
        return res.status(404).json({ message: "Certification not found" });
      }

      user.certifications.pull({ _id: certificationId });
      await user.save();

      res.status(200).json({ message: "Certification deleted successfully" });
    } catch (error) {
      console.error("Error deleting certification:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Create a new project
router.post("/create-project", verifyToken, async (req, res) => {
  try {
    const { title, role, description, startDate, endDate, techUsed } = req.body;

    if (!title || !role || !description || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res
        .status(400)
        .json({ message: "Start and end dates must be in dd/mm/yyyy format" });
    }

    let techUsedArray = [];
    if (techUsed) {
      if (Array.isArray(techUsed)) {
        techUsedArray = techUsed;
      } else if (typeof techUsed === "string") {
        techUsedArray = techUsed.split(",").map((tech) => tech.trim());
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newProject = {
      title,
      role,
      description,
      startDate,
      endDate,
      techUsed: techUsedArray,
    };

    user.projects.push(newProject);
    await user.save();

    const addedProject = user.projects[user.projects.length - 1];

    res.status(201).json({ project: addedProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a project
router.delete("/delete-project/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    user.projects.pull({ _id: projectId });
    await user.save();

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;