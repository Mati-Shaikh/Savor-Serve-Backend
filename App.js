const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const DonorRoutes = require('./routes/donorRoutes');
const NGORoutes = require('./routes/ngoRoutes');
const SupplierRoutes = require('./routes/supplierRoutes');
const AdminRoutes = require('./routes/adminRoutes');
const NeedyIndividual = require('./routes/needyIndividualRoutes');
const VoucherRoutes = require('./routes/voucherRoutes');
const admin = require("./scripts/adminCredentials");
const cors = require("cors");

dotenv.config();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_STRING, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(async() => {
    console.log("Connected to MongoDB----");
    await admin();
  })
  .catch((err) => console.error(err)); 

// Routes
app.use("/api/auth", authRoute);
app.use("/api/donor", DonorRoutes);
app.use("/api/ngo", NGORoutes);
app.use("/api/supplier", SupplierRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/needyInd",NeedyIndividual);
app.use("/api/donor",VoucherRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log("Backend is running.");
});
