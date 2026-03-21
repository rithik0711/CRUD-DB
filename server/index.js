const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri || typeof mongoUri !== "string" || mongoUri.trim() === "") {
  console.error("❌ Missing MONGO_URI in environment.");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Insert User
app.post("/users", async (req, res) => {
  try {
    const { name, reg_no, dept, year, mail } = req.body;

    if (!name || !reg_no || !dept || !year || !mail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.create({
      name,
      reg_no,
      dept,
      year,
      mail,
    });

    res.status(201).json({
      message: "User added successfully",
      userId: user._id,
      user,
    });
  } catch (err) {
    console.error("Error inserting user:", err);

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        error: `${field} already exists`
      });
    }

    // Handle validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message
      });
    }

    res.status(500).json({ error: "Failed to insert user" });
  }
});

// Fetch users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Update user
app.patch("/users/:id", async (req, res) => {
  try {
    const { name, reg_no, dept, year, mail } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, reg_no, dept, year, mail },
      {
        new: true, // Return the updated document
        runValidators: true // Run schema validation
      }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (err) {
    console.error("Error updating user:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        error: `${field} already exists`
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message
      });
    }

    res.status(500).json({ error: "Failed to update user" });
  }
});

// Serve React app for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


