const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new certification
router.post(
  "/certifications",
  verifyToken,
  upload.single("certificateImage"),
  async (req, res) => {
    try {
      const { title, duration, skillsObtained } = req.body;

      // Validate required fields
      if (!title || !duration) {
        console.log("[DEBUG] Validation failed: Title or duration missing");
        return res
          .status(400)
          .json({ message: "Title and duration are required" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        console.log("[DEBUG] User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      // Prepare new certification
      const newCertification = {
        title,
        duration,
        skillsObtained: JSON.parse(skillsObtained || "[]"),
        certificateImage: req.file ? req.file.buffer : null,
      };

      // Add to user's certifications
      user.certifications.push(newCertification);
      await user.save();
      console.log("[DEBUG] Certification added for user:", {
        userId: user._id,
        certificationId:
          user.certifications[user.certifications.length - 1]._id,
        hasImage: !!req.file,
      });

      // Get the newly added certification and convert buffer to base64
      const addedCertification =
        user.certifications[user.certifications.length - 1].toObject();
      if (addedCertification.certificateImage) {
        addedCertification.certificateImage =
          addedCertification.certificateImage.toString("base64");
      }

      res.status(201).json({ certification: addedCertification });
    } catch (error) {
      console.error("[ERROR] Creating certification:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update a certification
router.put(
  "/certifications/:certId",
  verifyToken,
  upload.single("certificateImage"),
  async (req, res) => {
    try {
      const { title, duration, skillsObtained } = req.body;
      const { certId } = req.params;

      // Validate required fields
      if (!title || !duration) {
        console.log("[DEBUG] Validation failed: Title or duration missing");
        return res
          .status(400)
          .json({ message: "Title and duration are required" });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        console.log("[DEBUG] User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      // Find the certification by ID
      const certification = user.certifications.id(certId);
      if (!certification) {
        console.log("[DEBUG] Certification not found for ID:", certId);
        return res.status(404).json({ message: "Certification not found" });
      }

      // Update certification fields
      certification.title = title;
      certification.duration = duration;
      certification.skillsObtained = JSON.parse(skillsObtained || "[]");
      certification.certificateImage = req.file
        ? req.file.buffer
        : certification.certificateImage;

      await user.save();
      console.log("[DEBUG] Certification updated:", {
        userId: user._id,
        certificationId: certId,
        hasImage: !!req.file,
      });

      // Convert buffer to base64 for response
      const updatedCertification = certification.toObject();
      if (updatedCertification.certificateImage) {
        updatedCertification.certificateImage =
          updatedCertification.certificateImage.toString("base64");
      }

      res.status(200).json({ certification: updatedCertification });
    } catch (error) {
      console.error("[ERROR] Updating certification:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get certifications
router.get("/certifications", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("certifications");
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Convert certificateImage buffers to base64
    const certifications = user.certifications.map((cert) => {
      const certObj = cert.toObject();
      if (certObj.certificateImage) {
        certObj.certificateImage = certObj.certificateImage.toString("base64");
      }
      return certObj;
    });

    res.status(200).json({ certifications });
  } catch (error) {
    console.error("[ERROR] Fetching certifications:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a certification
router.delete("/certifications/:certId", verifyToken, async (req, res) => {
  try {
    const { certId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const certification = user.certifications.id(certId);
    if (!certification) {
      console.log("[DEBUG] Certification not found for ID:", certId);
      return res.status(404).json({ message: "Certification not found" });
    }

    user.certifications.pull({ _id: certId });
    await user.save();
    console.log("[DEBUG] Certification deleted:", {
      userId: user._id,
      certificationId: certId,
    });

    res.status(200).json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("[ERROR] Deleting certification:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Project routes (unchanged)
router.post("/projects", verifyToken, async (req, res) => {
  try {
    const { title, myRole, description, startDate, endDate, techUsed } =
      req.body;

    if (!title || !myRole || !description || !startDate) {
      console.log("[DEBUG] Validation failed: Required project fields missing");
      return res
        .status(400)
        .json({
          message: "Title, myRole, description, and startDate are required",
        });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid startDate format" });
    }
    if (end && isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid endDate format" });
    }
    if (end && end < start) {
      return res
        .status(400)
        .json({ message: "endDate must be after startDate" });
    }

    const newProject = {
      title,
      myRole,
      description,
      startDate: start,
      endDate: end,
      techUsed: Array.isArray(techUsed) ? techUsed : [],
    };

    user.projects.push(newProject);
    await user.save();
    console.log("[DEBUG] Project added for user:", {
      userId: user._id,
      projectId: user.projects[user.projects.length - 1]._id,
    });

    const addedProject = user.projects[user.projects.length - 1];

    res.status(201).json({ project: addedProject });
  } catch (error) {
    console.error("[ERROR] Creating project:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/projects", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("projects");
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ projects: user.projects });
  } catch (error) {
    console.error("[ERROR] Fetching projects:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/projects/:projectId", verifyToken, async (req, res) => {
  try {
    const { title, myRole, description, startDate, endDate, techUsed } =
      req.body;
    const { projectId } = req.params;

    if (!title || !myRole || !description || !startDate) {
      console.log("[DEBUG] Validation failed: Required project fields missing");
      return res
        .status(400)
        .json({
          message: "Title, myRole, description, and startDate are required",
        });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      console.log("[DEBUG] Project not found for ID:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid startDate format" });
    }
    if (end && isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid endDate format" });
    }
    if (end && end < start) {
      return res
        .status(400)
        .json({ message: "endDate must be after startDate" });
    }

    project.title = title;
    project.myRole = myRole;
    project.description = description;
    project.startDate = start;
    project.endDate = end;
    project.techUsed = Array.isArray(techUsed) ? techUsed : [];

    await user.save();
    console.log("[DEBUG] Project updated:", { userId: user._id, projectId });

    res.status(200).json({ project });
  } catch (error) {
    console.error("[ERROR] Updating project:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/projects/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("[DEBUG] User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      console.log("[DEBUG] Project not found for ID:", projectId);
      return res.status(404).json({ message: "Project not found" });
    }

    user.projects.pull({ _id: projectId });
    await user.save();
    console.log("[DEBUG] Project deleted:", { userId: user._id, projectId });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("[ERROR] Deleting project:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
