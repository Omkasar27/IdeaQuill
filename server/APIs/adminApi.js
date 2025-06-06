const exp = require("express");
const adminApp = exp.Router();
const UserAuthor = require("../models/userAuthorModel");
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

adminApp.use(exp.json());

// Check if user is an admin 
adminApp.post(
  "/check-admin",
  expressAsyncHandler(async (req, res) => {
    try {

      const { email } = req.body;
      console.log(email)
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if user exists
      const user = await UserAuthor.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: "User not found", isAdmin: false });
      }

      if(user.role === 'admin') {
        return res.status(200).json({ 
          message: "Admin",
          isAdmin: true,
          userId: user._id,
          role: user.role
        });
      }else{
        return res.status(200).json({ 
          message: "Not Authorized as Admin",
          isAdmin: false,
          userId: user._id,
          role: user.role
        });
      }
      // Return user data with admin status
      
    } catch (error) {
      console.error("Admin verification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

// Get all users and authors 
adminApp.get(
  "/users-authors",
  expressAsyncHandler(async (req, res) => {
    try {
      //Add a simple authentication check using query parameter
      const { email } = req.query;
      
      if (email) {
        // Verify this is an admin by checking the database
        const adminUser = await UserAuthor.findOne({ email, role: 'admin' });
        
        if (!adminUser) {
          return res.status(403).json({ message: "Not authorized as admin" });
        }
      }
      
      const users = await UserAuthor.find();
      res.status(200).json({ 
        message: "Users fetched successfully", 
        payload: users 
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users and authors", error: error.message });
    }
  })
);

// Enable or disable a user/author (removing Clerk authentication)
adminApp.put(
  "/update-status/:email",
  expressAsyncHandler(async (req, res) => {
    try {
      const { email } = req.params;
      const { isActive, adminEmail } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }
      
      // Optional: Verify the requester is an admin
      if (adminEmail) {
        const adminUser = await UserAuthor.findOne({ email: adminEmail, role: "admin" });
        if (!adminUser) {
          return res.status(403).json({ message: "Not authorized as admin" });
        }
      }
      
      const user = await UserAuthor.findOneAndUpdate(
        { email },
        { isActive },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ 
        message: `User ${isActive ? "activated" : "deactivated"} successfully`, 
        payload: user 
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating user status", error: error.message });
    }
  })
);

module.exports = adminApp;