const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    reg_no: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
    },
    dept: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 1,
      max: 5,
    },
    mail: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
