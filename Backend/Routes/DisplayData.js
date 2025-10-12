// Routes/DisplayData.js
const express = require("express");
const router = express.Router();

router.post("/foodData", (req, res) => {
  try {
    if (!global.food_items || !global.food_categories) {
      return res.status(500).json({ error: "Food items or categories data not loaded" });
    }
    res.json([global.food_items, global.food_categories]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
