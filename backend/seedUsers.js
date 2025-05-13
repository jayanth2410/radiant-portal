const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust the path to your User model
const bcrypt = require("bcryptjs");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/radiant", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Generate dummy data
const generateDummyData = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10); // Hash the password
  const admins = [];
  const users = [];

  // Create 10 admins
  for (let i = 1; i <= 10; i++) {
    admins.push({
      fullName: `Admin ${i}`,
      email: `admin${i}@example.com`,
      password: hashedPassword,
      id: `admin${i}`,
      dateOfBirth: new Date(1980, i % 12, i % 28 + 1), // Random DOB
      phone: `987654321${i % 10}`,
      address: `Admin Address ${i}`,
      yearsOfExperience: Math.floor(Math.random() * 10) + 5, // Random experience between 5-15 years
      category: "admin", // Admin category
      projects: [`Admin Project ${i}`, `Admin Project ${i + 1}`],
      certifications: [`Admin Certification ${i}`, `Admin Certification ${i + 1}`],
      tasks: {
        completed: [],
        notCompleted: [],
      },
      tasksCreated: [], // Admin-specific field
    });
  }

  // Create 10 users
  for (let i = 1; i <= 10; i++) {
    users.push({
      fullName: `User ${i}`,
      email: `user${i}@example.com`,
      password: hashedPassword,
      id: `user${i}`,
      dateOfBirth: new Date(1995, i % 12, i % 28 + 1), // Random DOB
      phone: `123456789${i % 10}`,
      address: `User Address ${i}`,
      yearsOfExperience: Math.floor(Math.random() * 10) + 1, // Random experience between 1-10 years
      category: "user", // User category
      projects: [`User Project ${i}`, `User Project ${i + 1}`],
      certifications: [`User Certification ${i}`, `User Certification ${i + 1}`],
      tasks: {
        completed: [],
        notCompleted: [],
      },
    });
  }

  return { admins, users };
};

// Seed the database
const seedDatabase = async () => {
  try {
    const { admins, users } = await generateDummyData();

    // Clear existing data
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Insert admins and users
    const insertedAdmins = await User.insertMany(admins);
    const insertedUsers = await User.insertMany(users);
    console.log("Inserted dummy admins and users successfully");

    // Simulate tasks created by each admin and assigned to users
    for (let i = 0; i < insertedAdmins.length; i++) {
      const admin = insertedAdmins[i];
      const assignedUser = insertedUsers[i]; // Assign tasks to corresponding user (e.g., Admin 1 -> User 1)

      const task = {
        title: `Task ${i + 1} - Complete Documentation`,
        description: `Task assigned by ${admin.fullName} to ${assignedUser.fullName}`,
        deadline: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Deadline in (i+1) days
        assignedTo: [assignedUser._id],
        status: i % 2 === 0 ? "completed" : "pending", // Alternate between completed and pending
      };

      // Update admin's tasksCreated
      admin.tasksCreated.push(task);
      await admin.save();

      // Update user's tasks
      if (task.status === "completed") {
        assignedUser.tasks.completed.push(task.title);
      } else {
        assignedUser.tasks.notCompleted.push(task.title);
      }
      await assignedUser.save();
    }

    console.log("Tasks created and assigned successfully");

    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    mongoose.connection.close();
  }
};

seedDatabase();