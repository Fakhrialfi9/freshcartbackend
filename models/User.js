// User.js

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

// Define schema untuk User
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long"],
    validate: {
      validator: (value) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return /^(\+62|62|0)\d{8,15}$/.test(value);
      },
      message: "Invalid Indonesian phone number format",
    },
  },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postalCode: { type: String },
  avatarUser: { type: String },
  userName: {
    type: String,
    unique: true,
    minlength: [3, "Username must be at least 3 characters long"],
    validate: {
      validator: (value) => {
        return /^[a-zA-Z0-9_.-]*$/.test(value);
      },
      message: "Invalid username format",
    },
  },
  bio: { type: String },
  securityQuestions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
  verifyotp: { type: String },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// Hash password sebelum disimpan ke database
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Method untuk membandingkan password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Buat model User dari schema
const User = mongoose.model("User", userSchema);

export default User;
