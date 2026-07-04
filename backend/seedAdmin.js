// =============================================================
//  seedAdmin.js — Standalone Admin Database Seeder
// =============================================================

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Read from command-line arguments or environment variables, or use secure defaults
const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL || "admin@demo.com";
const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || "password123";

if (!adminEmail.endsWith("@gmail.com")) {
  console.error("Error: Admin email must end with @gmail.com due to domain restriction policy.");
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/book-a-doctor";

async function seedAdmin() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB.");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      console.log(`Warning: Admin with email "${adminEmail}" already exists.`);
      console.log("Updating their password and ensuring admin role...");
      
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      existingAdmin.type = "admin";
      existingAdmin.isActive = true;
      
      // Save directly bypassing double-hashing (we hashed it, so we can save it using updateOne)
      await User.updateOne(
        { _id: existingAdmin._id },
        { $set: { password: hashedPassword, role: "admin", type: "admin", isActive: true } }
      );
      
      console.log(`✓ Admin user password updated successfully.`);
      process.exit(0);
    }

    console.log(`Hashing password using bcrypt...`);
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    console.log(`Creating Admin user document...`);
    // Insert directly to bypass pre-save double hashing hook
    await User.collection.insertOne({
      name: "Administrator",
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      type: "admin",
      isActive: true,
      profilePhoto: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("=================================================");
    console.log("✓ Admin user seeded successfully!");
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log("=================================================");
    
  } catch (error) {
    console.error("✗ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

seedAdmin();
