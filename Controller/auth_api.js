const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require('../models/User.schema');
const Wallet = require('../models/Wallet.Schema');


const generateToken = (user) => {
  const payload = {
    _id: user._id,
    FullName: `${user.FirstName} ${user.LastName}`,
    Role: user.Role, // Include Role in the token
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const RegisterUser = async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password, PhoneNumber, Role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "You already have an account. Please Login." });
    }

    // Validate Role
    const validRoles = ["NGO", "Donor", "GroceryShop", "Admin"];
    if (!validRoles.includes(Role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(Password, salt);

    // Create a new user
    const newUser = new User({
      FirstName,
      LastName,
      Email,
      Password: hashedPass,
      PhoneNumber,
      Role, // Store the role
    });

    const user = await User.create(newUser);

    // Automatically create a wallet for the user
    await Wallet.create({ userId: user._id });


    // Generate a JWT token
    const token = generateToken(user);

    res.status(200).json({
      token, // JWT token
      user: {
        _id: user._id, // Return user ID
        FullName: `${user.FirstName} ${user.LastName}`, // Return full name
        Role: user.Role, // Return role
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


let DuplicateUser = async (req, res) => {
  try {

    const existingUser = await User.findOne({ Email: req.body.Email });
    
    if (existingUser) {
      return res.status(400).json({ message: "You already have an account. Please Login" });
    }
    
    
    res.status(200).json({ message: "Unique Email" });

  } catch (err) {
    res.status(500).json(err);
  }
};

let GoogleAuth = async (req, res) => {
  try {
    const { email, name, googleId, role } = req.body;

    // Validate Role
    const validRoles = ["NGO", "Donor", "GroceryShop", "Admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Check if user already exists
    let user = await User.findOne({ Email: email });

    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ");

    const randomPassword = crypto.randomBytes(8).toString("hex"); // Generate a random password
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    const hashedPass = await bcrypt.hash(randomPassword, salt); // Hash the password

    if (!user) {
      // Create a new user if they don't exist
      user = new User({
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        googleId,
        Password: hashedPass,
        Role: role, // Assign the role
      });
      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const token = generateToken(user); // Generate a token with the Role included

    res.status(200).json({
      token, // JWT token
      user: {
        _id: user._id, // Return user ID
        FullName: `${user.FirstName} ${user.LastName}`, // Return full name
        Role: user.Role, // Return role
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};



let LoginUser = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ Email: req.body.Email });

    // If user is not found, return an appropriate response
    if (!user) {
      return res.status(400).json({ message: "Wrong credentials!" });
    }

    // Compare provided password with stored hashed password
    const validated = await bcrypt.compare(req.body.Password, user.Password);

    // If password is incorrect, return an appropriate response
    if (!validated) {
      return res.status(400).json({ message: "Wrong credentials!" });
    }

    // Generate token with role included
    const token = jwt.sign(
      {
        _id: user._id,
        FullName: `${user.FirstName} ${user.LastName}`,
        Role: user.Role, // Include Role in token
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respond with token and user information
    res.status(200).json({
      token, // JWT token
      user: {
        _id: user._id,
        FullName: `${user.FirstName} ${user.LastName}`, // Full name
        Role: user.Role, // Role for dashboard rendering
      },
    });
  } catch (err) {
    // Handle errors
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


let VerifyUserCredentials = async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.body.Email });

    if (!user) {
      // If user is not found
      return res.status(400).json("User not found!");
    }


    const pin = crypto.randomInt(10000, 99999); // Generate a 6-digit PIN
    user.resetPin = pin;
    user.pinExpires = Date.now() + 300000;  // PIN valid for 1 hour
    await user.save();

    // Set up Nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.Email,
      subject: "Password Reset PIN",
      text: `Your password reset PIN is ${pin}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error); // Log the specific error
        return res.status(401).json({ message: "Error sending email", error: error.message });
      }
      res.status(200).json({ message: "PIN sent to your email" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};


let VerifyEmail = async (req, res) => {
  try {
    
    const pin = crypto.randomInt(10000, 99999); // Generate a 6-digit PIN
   
    // Set up Nodemailer to send the email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.Email,
      subject: "Email Verification PIN",
      text: `Your email verification PIN is ${pin}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error); // Log the specific error
        return res.status(401).json({ message: "Error sending email", error: error.message });
      }
      res.status(200).json({ message: "PIN sent to your email", pin: pin });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};

const VerifyPIN = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const user = await User.findOne({ Email:email, resetPin: pin, pinExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired PIN' });
    }

    res.status(200).json({ message: 'PIN verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }

};


const UpdateUserPassword = async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.body.Email });

    if (!user) {
      // If user is not found
      return res.status(400).json("User not found!");
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.NewPassword, salt);

    // Update user's password in the database
    user.Password = hashedPassword;
    await user.save();

    res.status(200).json("Password updated successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal server error");
  }
};


const ProtectedRoute = (req, res) => {
  const decodedUserId = res.locals.userId; // The ID from the decoded token
  const { userId } = req.body; // Expecting userId from the request body

  // Check if the IDs match
  if (decodedUserId === userId) {
    return res.status(200).json({
      message: 'Token is valid',
      userId: decodedUserId,
      userFullName: res.locals.userFullName,
      role: res.locals.role, // Assuming role is also in the token (you can add it to the payload when generating the token)
    });
  } else {
    return res.status(401).json({ message: 'Access denied: Invalid user ID' });
  }
};




//get user profile
let GetUserProfile = async (req,res) =>{
  const userId = res.locals.userId; // Assuming your middleware sets the user ID in req.user

  try {
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



let UpdateUserProfile = async (req, res) => {
  // User ID is available from the middleware
  let id = res.locals.userId;
  let data = req.body;

  try {
    let user = await User.findByIdAndUpdate(id, data, { new: true });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating user', err: err });
  }
};

//delete user
let Deleteuser =  async(req ,res)=>{
    let id = res.locals.userId;
    let users = await Freelance.findByIdAndDelete(id);
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}



module.exports = { RegisterUser, LoginUser, VerifyUserCredentials, VerifyPIN, UpdateUserPassword , ProtectedRoute, UpdateUserProfile, Deleteuser, GetUserProfile, GoogleAuth, VerifyEmail, DuplicateUser};