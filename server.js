import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Enable JSON request body parsing
app.use(express.json());

// Mount user authentication routes
app.use("/api/users", userRoutes);

// Set server port
const PORT = process.env.PORT || 3000;

// Start server after connecting to MongoDB
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
