const jwt = require("jsonwebtoken");
const User = require("../models/User.schema"); // Import your user model

// Middleware to verify JWT token and fetch user details
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json("Access denied");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from the database
    const user = await User.findById(decoded._id);
    if (!user) return res.status(404).json("User not found");

    // Store user details in `res.locals`
    res.locals.userId = user._id;
    res.locals.userFullName = `${user.FirstName} ${user.LastName}`;
    res.locals.userRole = user.Role; // Store the Role

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token error in verifyToken middleware:", error);
      return res.status(401).json("Invalid token");
    } else {
      console.error("Error in verifyToken middleware:", error);
      return res.status(500).json("Internal Server Error");
    }
  }
};

module.exports = verifyToken;
