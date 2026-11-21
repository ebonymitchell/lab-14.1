import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Initialize Express router
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        // Check whether the email is already registered
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "A user with this email already exists"
            });
        }

        // Create and save the user
        // The User model automatically hashes the password
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Return user information without the password
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        // Handle duplicate email errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: "A user with this email already exists"
            });
        }

        // Handle invalid user data
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        // Handle unexpected server errors
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Server error during registration"
        });
    }
});

// Authenticate an existing user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find the user and explicitly retrieve the password hash
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        // Reject unrecognized email addresses
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        // Compare the submitted password with the stored hash
        const isMatch = await user.isCorrectPassword(password);

        // Reject incorrect passwords
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect email or password"
            });
        }

        // Create a signed JWT containing non-sensitive user data
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // Return the token and user information without the password
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        // Handle unexpected authentication errors
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error during login"
        });
    }
});

export default router;
