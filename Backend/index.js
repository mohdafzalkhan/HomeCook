// index.js
const express = require("express");
const cors = require("cors");
const mongoDB = require("./db");
const mongoose = require("mongoose");

const app = express();
const port = 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.38.20:3000",
      "https://home-cook-git-master-mohdafzalkhans-projects.vercel.app",
      "https://home-cook-mlgth5ah5-mohdafzalkhans-projects.vercel.app",
      "https://home-cook-tan.vercel.app"
      
    ],
     credentials: true
  })
);
app.use((req, res, next) => {
  console.log("[DEBUG] ORIGIN:", req.headers.origin);
  next();
});

app.use(express.json());

// Routes
app.use("/api", require("./Routes/Createuser"));
app.use("/api", require("./Routes/DisplayData"));
app.use("/api", require("./Routes/OrderData"));

app.use("/api", require("./Routes/FoodManagement"));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Connect to MongoDB first, then start server
mongoDB()
  .then(async () => {
    // Make database accessible to routes
    app.locals.db = mongoose.connection.db;

    // Initialize global food items and categories
    try {
      const foodItemsCollection = app.locals.db.collection("food_items");
      const categoriesCollection = app.locals.db.collection("food_categories");

      global.food_items = await foodItemsCollection.find({}).toArray();
      global.food_categories = await categoriesCollection.find({}).toArray();

      console.log("Global food_items and food_categories initialized");
    } catch (err) {
      console.error("Error initializing global data:", err);
      global.food_items = [];
      global.food_categories = [];
    }

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
