const mongoose = require("mongoose");
const User = require("../models/User.schema"); // Adjust the path to your user schema
const bcrypt = require("bcrypt");

const createAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ Email: "admin@gmail.com" });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin", 10);

    const adminUser = new User({
      FirstName: "admin",
      LastName: "admin",
      Email: "admin@gmail.com",
      Password: hashedPassword,
      PhoneNumber: "+923319876543",
      Role: "Admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  }
};

module.exports = createAdminUser;
