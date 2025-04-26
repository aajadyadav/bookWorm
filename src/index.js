import express from "express";
import authRoutes from "../routes/authRoutes.js";
import { connectDB } from "../db/dbConnect.js";
import bookRoutes from "../routes/bookRoutes.js";
import cors from "cors";
// import User from "../models/User.js";
import bcrypt from "bcryptjs";
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Start the server
app.listen(3000, async () => {
    try {
        await connectDB();
        console.log("Database Connected");
        console.log("Server is running on port 3000");
    } catch (error) {
        console.error("Failed to connect to the database:", error.message);
        process.exit(1); // Exit the process if the database connection fails
    }
});