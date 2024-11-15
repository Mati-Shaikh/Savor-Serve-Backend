const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const cors = require("cors");

dotenv.config();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_STRING, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB----");
  })
  .catch((err) => console.error(err)); 

// Routes
app.use("/api/auth", authRoute);

// Start the server
app.listen(process.env.PORT, () => {
  console.log("Backend is running.");
});
