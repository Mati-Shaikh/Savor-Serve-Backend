const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    FirstName: {
      type: String,
      default: "", // Default value for FirstName
    },
    LastName: {
      type: String,
      default: "", // Default value for LastName
    },
    Email: {
      type: String,
      default: "", // Default value for Email
      required: true,
      unique: true, // Ensure email is unique
      match: [/\S+@\S+\.\S+/, 'is invalid'], // Basic email validation
    },
    Password: {
      type: String,
      default: "", // Default value for Password
      required: function () {
        // Password is required only for non-OAuth users
        return !this.googleId;
      },
    },
    PhoneNumber: {
      type: String, // Change to String to handle international phone numbers
      default: "+92300000000",
      match: [/^\+?\d{10,15}$/, "is invalid"], // Basic phone validation
    },
    Role: {
      type: String,
      enum: ["NGO", "Donor", "GroceryShop", "Admin"], // Allowed roles
      required: true, // Role is mandatory
      default: "Donor", // Default role
    },
    resetPin: {
      type: String, // Store the reset PIN
    },
    pinExpires: {
      type: Date, // Expiry time for the PIN
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values while keeping the field unique
    },
  },
  { timestamps: true }
);

const model = mongoose.model("User", userSchema);
module.exports = model;
