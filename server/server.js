const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http");
const socket = require("socket.io");

require("dotenv").config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB connected successfully`);
  })
  .catch((err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

const server = http.createServer(app);

const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const jobController = require("./controllers/jobController");

jobController.setIoInstance(io);

const Vendor = require("./Models/Vendor");

io.on("connection", (socket) => {
  console.log(`New client connected : ${socket.id}`);
  socket.on("vendorConnect", async (vendorId) => {
    await Vendor.findByIdAndUpdate(vendorId, {
      isAvailable: true,
      socketId: socket.id,
    });
    console.log(`Vendor is now online with socket ID: ${socket.id}`);
  });

  socket.on("disconnect", async () => {
    const vendor = await Vendor.findOne({ socketId: socket.id });
    if (vendor) {
      await Vendor.findByIdAndUpdate(vendor._id, {
        isAvailable: false,
        socketId: null,
      });
      console.log(`Vendor with socket ID: ${socket.id} is now offline`);
    } else {
      console.log(
        `Client disconnected : ${socket.id} (not a registered vendor)`
      );
    }
  });
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("RealTime Seva backend is running!");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
