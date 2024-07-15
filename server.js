// server.js

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(express.json());
// app.use(cors());

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI, {});

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", function () {
//   console.log("Connected to MongoDB!");
// });

// // User Routes
// const mainRoutes = require("./routes/routes");
// app.use("/api", mainRoutes);

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
